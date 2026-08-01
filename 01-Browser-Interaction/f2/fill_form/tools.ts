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
