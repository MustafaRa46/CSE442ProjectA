const {Builder, By, Key} = require('selenium-webdriver');
const { DriverService } = require('selenium-webdriver/remote');
const test_email = "script@test.com";
const test_password = "123";
const correct_message = "Please enter a valid account ID";
const test_user_id = "10";

(async function test_login_editprofile() {
    let driver = await new Builder().forBrowser('chrome').build();

    // log in

    await driver.get('https://doggos.herokuapp.com/login');

    await driver.findElement(By.name('email')).sendKeys(test_email, Key.TAB);

    await driver.findElement(By.name('password')).sendKeys(test_password, Key.ENTER);

    // first click search submit without entering an user id

    let buttons = await driver.findElements(By.css('button'));

    var searchSubmitButton = buttons[1];

    const actions = driver.actions({async:true});

    await actions.move({origin:searchSubmitButton}).press().perform();

    await actions.move({origin:searchSubmitButton}).release().perform();

    // check confirmation message

    let messages = await driver.findElements(By.css('div'));

    var conf_message = await messages[5].getText();

    if (conf_message.includes(correct_message)){
        console.log("Found unsuccessful confirmation message for entering no user id.");
    }else{
        console.log("Did not find confirmation message for entering no user id.");
    }

    // now enter an invalid user id and click search

    await driver.findElement(By.name('accountidsearched')).sendKeys(test_user_id, Key.TAB, Key.ENTER);

    let all_messages = await driver.findElements(By.css('div'));

    var confirmation_message = await all_messages[5].getText();

    if (confirmation_message.includes(correct_message)){
        console.log("Found unsuccessful confirmation message for entering an invalid user id.");
    }else{
        console.log("Did not find confirmation message for entering invalid id.")
    }

    driver.quit();
})();