const {Builder, By, Key} = require('selenium-webdriver');

var test_pfirst_name = "firstnamePet";
var test_plast_name = "lastnamePet";
var test_ofirst_name = "firstnameOwner";
var test_olast_name = "lastnameOwner";
var email = "testscript123456@email.com";
var password = "abcdefghi";

(async function signup(){
    let driver = await new Builder().forBrowser('chrome').build();

    await driver.get('https://doggos.herokuapp.com/signup');

    await driver.findElement(By.name('firstname')).sendKeys(test_pfirst_name, Key.TAB);

    await driver.findElement(By.name('lastname')).sendKeys(test_plast_name, Key.TAB);

    await driver.findElement(By.name('ofirstname')).sendKeys(test_ofirst_name, Key.TAB);

    await driver.findElement(By.name('olastname')).sendKeys(test_olast_name, Key.TAB);

    await driver.findElement(By.name('email')).sendKeys(email, Key.TAB);

    await driver.findElement(By.name('password')).sendKeys(password, Key.ENTER);

    driver.quit();
})();