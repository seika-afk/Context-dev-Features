
import { StateGraph, START, END } from "@langchain/langgraph";

type BrowserState = {
  query: string;
  html: string;

 //for llm1
  label?: string;
  value?: string;

  //llm2

  tool?: string;


}

async function run(query:string,html:string) {

  //LLM 1
  async function ExtractLabelsLLM(state: BrowserState): Promise<Partial<BrowserState>> {

    return {
      label: "Email", //lets imagine ,its set by ai
      value: "abc@gmail.com",
    };
  }

  //LLM2
  async function DecideToolLLM(state: BrowserState): Promise<Partial<BrowserState>> {
    console.log(state.label);
    console.log(state.value);

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
      query: {},
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

    query: "Test Query",
    html: `
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

  </form>`
  })

  console.log(result)
}

run()
