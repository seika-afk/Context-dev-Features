import { tool } from "@langchain/core/tools";
import { page } from "./fill_form";
import { z } from "zod";

export const fillInputTool = tool(
  async ({ label, value }) => {
    await page.getByLabel(label).fill(value);
    return "Successfully inserted input";
  }, {
    name: "fill_input",
    description: "Fill a text input or textarea using its label.",
    schema: z.object({
      label: z.string().describe("Label of the input"),
      value: z.string().describe("Value to be filled"),
    })
  }
);

export const selectOptionTool = tool(
  async ({ label, value }) => {
    const locator = page.getByLabel(label);
    await locator.selectOption({ label: value }).catch(async () => {
      await locator.selectOption(value);
    });
    return "Successfully selected option";
  },
  {
    name: "select_option",
    description: "Select a dropdown option using the visible label of the select control.",
    schema: z.object({
      label: z.string().describe("Label of the select control"),
      value: z.string().describe("Visible option text to choose"),
    }),
  }
);

export const checkCheckboxTool = tool(
  async ({ label }) => {
    await page.getByLabel(label).check();
    return "Successfully checked checkbox";
  },
  {
    name: "check_checkbox",
    description: "Check a checkbox using its label.",
    schema: z.object({
      label: z.string().describe("Label of the checkbox"),
      value: z.string().optional().describe("Unused"),
    }),
  }
);

export const uncheckCheckboxTool = tool(
  async ({ label }) => {
    await page.getByLabel(label).uncheck();
    return "Successfully unchecked checkbox";
  },
  {
    name: "uncheck_checkbox",
    description: "Uncheck a checkbox using its label.",
    schema: z.object({
      label: z.string().describe("Label of the checkbox"),
      value: z.string().optional().describe("Unused"),
    }),
  }
);

export const selectRadioTool = tool(
  async ({ label }) => {
    await page.getByLabel(label).check();
    return "Successfully selected radio option";
  },
  {
    name: "select_radio",
    description: "Select a radio button using its label.",
    schema: z.object({
      label: z.string().describe("Label of the radio option"),
      value: z.string().optional().describe("Unused"),
    }),
  }
);

export const clickButtonTool = tool(
  async ({ label }) => {
    const button = page.getByRole("button", { name: label });
    await button.click().catch(async () => {
      await page.getByText(label).click();
    });
    return "Successfully clicked button";
  },
  {
    name: "click_button",
    description: "Click a button or button-like control using its visible text.",
    schema: z.object({
      label: z.string().describe("Visible button text"),
      value: z.string().optional().describe("Unused"),
    }),
  }
);

export const browserTools = [
  fillInputTool,
  selectOptionTool,
  checkCheckboxTool,
  uncheckCheckboxTool,
  selectRadioTool,
  clickButtonTool,
];

export async function submitForm(text: string): Promise<string> {
  const context = page.context();

  const [newPage] = await Promise.all([
    context.waitForEvent("page", { timeout: 3000 }).catch(() => null),
    page.getByText(text).click(),
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
