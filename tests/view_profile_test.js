const {Builder, By, Key} = require('selenium-webdriver');

const test_email = "script@test.com";
const test_password = "123";

(async function test_view_profile() {
    let driver = await new Builder().forBrowser('chrome').build();

    await driver.get('https://doggos.herokuapp.com/login');

    await driver.findElement(By.name('email')).sendKeys(test_email, Key.TAB);

    await driver.findElement(By.name('password')).sendKeys(test_password, Key.ENTER);

    await driver.get('https://doggos.herokuapp.com/explore_matches');

    var view_profile_buttons = await driver.findElements(By.css('button'));

    var test_good = true;

    for (var i = 3; i < view_profile_buttons.length; i = i + 2){
        
        // click the view profile button
        const actions = driver.actions({async: true});
        await actions.move({origin:view_profile_buttons[i]}).press().perform();
        await actions.move({origin:view_profile_buttons[i]}).release().perform();


        let big_name = await driver.findElements(By.css('h3'));
        var bold_name = await big_name[0].getText();
        bold_name = bold_name.trim().split(" ");

        // console.log(bold_name);

        let profile_info = await driver.findElements(By.css('p'));
        var pet_first_name = await profile_info[1].getText();
        var pet_last_name = await profile_info[2].getText();

        pet_first_name = pet_first_name.slice(11).trim();
        pet_last_name = pet_last_name.slice(10).trim();
        // console.log(pet_first_name);
        // console.log(pet_last_name);

        if (pet_first_name != bold_name[0].trim() || pet_last_name != bold_name[1].trim()){
            test_good = false;
        }

        await driver.navigate().back();
        await driver.navigate().refresh();

        view_profile_buttons = await driver.findElements(By.css('button'));

    }

    if (test_good){
        console.log("View Profile shows user's profile successfully.");
    }else{
        console.log("Didn't show profile successfully.")
    }

    driver.quit();
})();