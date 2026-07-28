This  md consists logic of all my decisions taken here in this Feature.

View its excalidraw ,since i like to draw or visualize more .


For Starting , this is my todo : 

- [x] Start a headless browser
                - Mention start and end

Started here https://playwright.dev/docs/api/class-playwright , tho for typescript, Started and explored a bit of headless browser
-> i am thinking of structuring the code later -> i.e utilizing one constructor for pages and browser and just the connected functions in oops. For now adding these Initials
  - timeout policy 
  - Retrying loop
  - other features
- [x] Time out policy integration
Added A overall timeout policy of 10seconds
and 3 trials before ughing out(later will return a status code will decide later)

- [x] Take input 
            - URL
            - Natural lang message where to click
easy peasy just get the user's input

-

Now we need to use one approach :
either use context api ,to forward this nlum(nlu message) to context'
llm and recieve the "text" where exactly to be clicked
or
use my openrouter to get that exact info but - by comparing the stored html and the nlum
then get -> "text" to be clicked

I think i will go with using llm , since even if it does integrated , its just plugging in different llm.
and it will remain consistent with the later comparison rather than fitting in context api.


- [x] Have the button Clicked
- [x] Handle Change
            - [x] Url change? -> Api
            - [x] rescrape and return changed dm

Feature 1's functionality part is done, now i just gotta clean the code, use oops here and expose endpoint via express or smtg, to be able to use .
Have divided the hugeass file into components , for mantaining it easily

---
### Feature 2 : Fill form
