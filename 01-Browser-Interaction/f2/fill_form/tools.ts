import { Page } from "playwright";
import { tool } from "@langchain/core/tools";
import {page} from "./fill_form"
import { z } from "zod";


export const fillInputTool = tool(

  async ({ label, value }) => {
    await page.getByLabel(label).fill(value);
    return "Successfully inserted input"

  }, {
    name: "fill_input",
    description: "Fill a text input or textarea using its label.",
    schema: z.object({
      label: z.string().describe("Label of the input"),
        value:z.string().describe("Value to be filled")
    })
}

)
export async function submitForm(): Promise<string> {
  const context = page.context();


  const [newPage] = await Promise.all([
    context.waitForEvent("page", { timeout: 3000 }).catch(() => null),
    page.getByText("Submit").click(),
  ]);

  let targetPage = page;

  if (newPage) {
    console.log("New tab opened, switching context to it");
    await newPage.waitForLoadState("networkidle").catch(() => {});
    targetPage = newPage;
  } else {
    await page.waitForLoadState("networkidle").catch(() => {});
  }


  const html = await targetPage.content();
  return html;
}
