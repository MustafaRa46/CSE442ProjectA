const {Builder, By, Key} = require('selenium-webdriver');
const test_email = "script@test.com";
const test_password = "123";

(async function test_login_editprofile() {
    let driver = await new Builder().forBrowser('chrome').build();

    // log in

    await driver.get('https://doggos.herokuapp.com/login');

    await driver.findElement(By.name('email')).sendKeys(test_email, Key.TAB);

    await driver.findElement(By.name('password')).sendKeys(test_password, Key.ENTER);

    // go to edit profile page

    await driver.get('https://doggos.herokuapp.com/edit');

    // click the upload image button without selecting a profile picture

    let uploadImageButton = await driver.findElements(By.css('button'));

    const actions = driver.actions({async:true});

    await actions.move({origin:uploadImageButton[3]}).press().perform();

    await actions.move({origin:uploadImageButton[3]}).release().perform();

    // check the confirmation message says unsucessful

    let get_message = await driver.findElements(By.css('div'));

    var confirmation_message = await get_message[5].getText();

    if (confirmation_message.includes('unsuccessful')){
        console.log('Profile picture did not update.');
    }else{
        console.log('Profile picture did update without selecting a profile picture.');
    }

    driver.quit();
})();