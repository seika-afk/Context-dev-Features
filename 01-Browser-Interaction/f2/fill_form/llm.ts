
import { StateGraph, START, END } from "@langchain/langgraph";
import { ChatOpenRouter } from "@langchain/openrouter";
import { EXTRACT_LABELS_PROMPT } from "./prompts";
import { z } from "zod";
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const labelSchema = z.object({
  label: z.string().describe("Label from html content, we will later user that label to fill the detail ,so mantain accuracy"),
  value:z.string().describe("Value take from FIELD DATA, be accurate")
})

const model = new ChatOpenRouter({
  model: "deepseek/deepseek-chat-v3.1",
  temperature: 0,
  maxTokens: 100,
});
const sodel= model.withStructuredOutput(labelSchema, {
  name: "Extract Labels and value",
  method: "jsonSchema",
});


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

  //LLM 1
  async function ExtractLabelsLLM(state: BrowserState): Promise<Partial<BrowserState>> {
    const  LABEL= await sodel.invoke([
      {
        role: "system",
        content:EXTRACT_LABELS_PROMPT,
      },
      {
        role: "user",
        content:
        html+"--------------------- FIELD DATA ->"+field_data
,
      },
    ]);
    console.log(LABEL);

    return LABEL
  }

  //LLM2
  async function DecideToolLLM(state: BrowserState): Promise<Partial<BrowserState>> {

    // Another LLM call

    return {
      tool: "getByLabel",
    };
  }

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

  graph.addNode("labels_LLM", ExtractLabelsLLM)
  graph.addNode("decide_LLM", DecideToolLLM)

  graph.addEdge(START, "labels_LLM")
  graph.addEdge("labels_LLM", "decide_LLM")
  graph.addEdge("decide_LLM", END)

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
