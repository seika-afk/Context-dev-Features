//import fs from "fs/promises";
import { ask_llm, final_llm } from "./llmHelper";
import { clickByText, startBrowser } from "./browserHelpers";
import { extractClickables, truncate } from "./textCutRelated";

const run = async (url: string, nlum: string, msg: string) => {
  const { browser, page } = await startBrowser();
  console.log("Started browser");
//try 3 times -> trial1,2,3->
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

  const clickable_elements = truncate(await extractClickables(page));

  const text = await ask_llm(nlum, clickable_elements);
  console.log("HTML_LLM found :", text);

  if (text === "invalid") {
    throw new Error(`No matching element found for query: "${nlum}"`);
  }
  if (text === "Multiple") {
    throw new Error(`Multiple matching elements found for query: "${nlum}" — need to disambiguate`);
  }
  console.log("Clicking...");

  const context = page.context();
  const [newPage] = await Promise.all([
    context.waitForEvent("page", { timeout: 3000 }).catch(() => null),
    clickByText(page, text),
  ]);

  let targetPage = page;
  if (newPage) {
    console.log("New tab opened, switching context to it");
    await newPage.waitForLoadState("networkidle").catch(() => {});
    targetPage = newPage;
  } else {
    await page.waitForLoadState("networkidle").catch(() => {});
  }
  console.log("Clicked", text);

  // console.log("END")
  console.log("Recieved Content from : ", targetPage.url());

  // THIRD PART

  console.log("Asking about page state...");
  const result = await final_llm(msg, targetPage);
//  await fs.writeFile("output.txt", "\n----------\n" + result, { flag: 'a' });
  console.log(result);

  await browser.close();
};
//////////////////////////////////////TEST
run(
  "https://github.com/seika-afk/Pairleet",
  "click on the seika-afk author/username link at the top",
  "get me the number of contribution in last year"
);
