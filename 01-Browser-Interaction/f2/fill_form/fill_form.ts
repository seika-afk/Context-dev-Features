import { startBrowser } from "../../Code/Click_feature/browserHelpers";
import {run_graph} from "./llm"
export const { browser, page } = await startBrowser();
console.log("Started browser");
let ANSWER:string=""
const run = async (url: string, field_data: string, query: string) => {
  const startedAt = Date.now();
  console.log("-----STARTED-------");
  try {
    // Try 3 times -> trial1,2,3
    for (let i = 0; i < 3; i++) {
      try {
        console.log("Trial:", i);
        await page.goto(url, { timeout: 10000 });
        break;
      } catch (err) {
        if (i === 2) {
          throw new Error(`Failed to load ${url} after 3 attempts`, {
            cause: err,
          });
        }
      }
    }

    const html = await page.content();
    console.log("--- RECIEVED HTML ");
    console.log(" FORWARDING TO LLM Graph");
    // call to function -> give (field_data,html)
    ANSWER= await run_graph(html, field_data, query);
  } finally {
    const elapsedSeconds = (Date.now() - startedAt) / 1000;

    await browser.close();

    console.log("----------------------------------")
console.log("------FINISHED")
    console.log(`TOOK: ${elapsedSeconds.toFixed(2)}s`);

  }
}

const url = "https://input-fields-theta.vercel.app/"
const query = "just summarize what what is in the page"

//url ,field info, final query related to page that comes after submitting



await run(url, "Fill my email as dummy@gmail.com and set my fav pokemon as charizard and select trainer type as  collector ,agree to terms ", query)






console.log("------")
console.log("Results: ")
console.log("URL : ", url)
console.log("Query: ", query)

console.log("Answer: ",ANSWER)
