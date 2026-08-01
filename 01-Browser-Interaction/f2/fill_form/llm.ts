
import { StateGraph, START, END } from "@langchain/langgraph";
import { ChatOpenRouter } from "@langchain/openrouter";
import { EXTRACT_DATA_PROMPT, EXTRACT_LABELS_PROMPT, EXTRACT_TOOLS_PROMPT } from "./prompts";
import { z } from "zod";
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url";
import { fillInputTool } from "./tools";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const model = new ChatOpenRouter({
  model: "deepseek/deepseek-chat-v3.1",
  temperature: 0,
  maxTokens: 100,
});

const labelSchema = z.object({
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

type BrowserState = {
  final_query: string;
  field_data: string;
  html: string;

 //for llm1
  label?: string;
  value?: string;

  //llm2

  tool?: string;

  success?:boolean


}
async function run(html:string,field_data:string,query:string) {

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
    console.log("RESPONSE");
    console.log(response);

    return {
      label: response.label,
      value: response.value,
      tool: response.tool,
    };
  }
const sodel =  model.bindTools([fillInputTool])
// LLM3
// llm that recursively runs tools  to fill form

  async function RunToolsRecursively(state: BrowserState): Promise<Partial<BrowserState>>{

// to length of the state, keep running tools and fill stuff


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

  graph.addNode("extract_data", ExtractDataLLM)

  graph.addEdge(START, "extract_data")
  graph.addEdge("extract_data", END)

  const app = graph.compile();


  const result = await app.invoke({

    final_query:query,
    html: html,
    field_data:field_data
  })

  console.log(result)
}
const html = `
<form>

  <input
    placeholder="Email"
    type="email"
  />

  <input
    placeholder="Password"
    type="password"
  />

  <button>
    Sign In
  </button>

</form>
`;
run(html ,"Fill my email as aaf@gmail.com","")
