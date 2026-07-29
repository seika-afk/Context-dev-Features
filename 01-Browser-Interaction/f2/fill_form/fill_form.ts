import { startBrowser } from "../../Code/Click_feature/browserHelpers";


const run = async (url: string, field_data: string, query: string) => {

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
  const html = page.content();
  //call to function -> give (field_data,html)

}

const url = ""
//url ,field info, final query
run(url,)
