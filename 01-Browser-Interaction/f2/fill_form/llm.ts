
import { StateGraph, START, END } from "@langchain/langgraph";
import { ChatOpenRouter } from "@langchain/openrouter";
import { EXTRACT_DATA_PROMPT, EXTRACT_LABELS_PROMPT, EXTRACT_TOOLS_PROMPT, FILL_FORM_PROMPT, FINAL_PROMPT } from "./prompts";
import { z } from "zod";
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url";
import { fillInputTool, submitForm } from "./tools";

export const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

let ANSWER:string= ""
export const model = new ChatOpenRouter({
  model: "deepseek/deepseek-chat-v3.1",
  temperature: 0,
  maxTokens: 100,
});

export const labelSchema = z.object({
  label: z.string().describe("Label from html content, we will later use that label to fill the detail, so maintain accuracy"),
  value: z.string().describe("Value taken from FIELD DATA, be accurate"),
  tool: z.string().describe(
    "Name of the tool best suited to perform this action, e.g. 'fill_input'. Return 'none' if no matching element/tool can be confidently identified."
  ),
});


const st_model= model.withStructuredOutput(labelSchema, {
  name: "Extract Labels and value",
  method: "jsonSchema",
});
//const sodel = model.bindTools([fillInputTool])

export type BrowserState = {
  final_query: string;
  field_data: string;
  html: string;

 //for llm1
  label?: string;
  value?: string;

  //llm2

  tool?: string;

  success?: boolean

  answer?: string;


}
export async function run_graph(html:string,field_data:string,query:string) {

  //LLM 1+LLM2
  async function ExtractDataLLM(state: BrowserState): Promise<Partial<BrowserState>> {
    const response = await st_model.invoke([
      {
        role: "system",
        content: EXTRACT_DATA_PROMPT,
      },
      {
        role: "user",
        content: html + "--------------------- FIELD DATA ->" + field_data,
      },
    ]);
    console.log("-----LLM 1 : ")
    console.log("----RESPONSE");
    console.log(response);
console.log("-------------")
    return {
      label: response.label,
      value: response.value,
      tool: response.tool,
    };
  }
// LLM3
// llm that recursively runs tools  to fill form
  async function RunToolsRecursively(state: BrowserState): Promise<Partial<BrowserState>> {
    console.log("------LLM2 : ")
    const sodel = model.bindTools([fillInputTool])
    const result = await sodel.invoke([
      {
        role: "system",
        content: FILL_FORM_PROMPT,
      },
      {
        role: "user",
        content: `TOOL TO BE USED: ${state.tool}, LABEL: ${state.label}, VALUE: ${state.value}`,
      },
    ]);

    const toolCall = result.tool_calls?.[0];
    console.log("Using Tool")
    if (!toolCall) {
      console.log("error: model did not call a tool");
      return { success: false };
    }

    try {
      if (toolCall.name === "fill_input") {
        await fillInputTool.func(toolCall.args as { label: string; value: string });
      } else {
        console.log("error: unknown tool", toolCall.name);
        return { success: false };
      }

    } catch (err) {
      console.log("error", err);
      return { success: false };
    }
    console.log("_------- SUBMITTING")
    const html = await submitForm()
    console.log("Form Submitted.")
    console.log("Answering Query : ", state.final_query)
    const res = await model.invoke([

      {
        role: "system",
        content: FINAL_PROMPT,
      },
      {
        role: "user",
        content: "HTML CONTENT:  " + html + "--------------------- QUERY ->" + state.final_query,
      },

    ])
    ANSWER= res.content
  console.log("----Answered")
    return {
      success: true,
      answer: res.content as string,

    }
  }
  ///////////////////////GRAPH

  const graph = new StateGraph<BrowserState>({
    channels: {
      final_query: {},
      field_data:{},
      html: {},

      label: {},
      value: {},
      tool: {},
    }

  })
console.log("--------STARTING GRAPH")
  graph.addNode("extract_data", ExtractDataLLM)
  graph.addNode("run_tools", RunToolsRecursively)

  graph.addEdge(START, "extract_data")
  graph.addEdge("extract_data", "run_tools")
  graph.addEdge("run_tools", END)
  const app = graph.compile();


  const ress = await app.invoke({

    final_query:query,
    html: html,
    field_data:field_data
  })
console.log("--------CLOSING GRAPH")
  return ANSWER
  }
