const {Builder, By, Key} = require('selenium-webdriver');
const test_email = "script@test.com";
const test_password = "123";
const test_pet_first_name = "sfdihsdfpdfnigni9812sd";
const test_pet_last_name = "0jd09222222222223n1ine";
const test_pet_breed = "ids22222222222222ifi";
const test_pet_gender = "nsdfsfsdf8444444444";
const test_biography = "nie9w812nie01111111111111111111111wnei";


(async function test_login_editprofile() {
    let driver = await new Builder().forBrowser('chrome').build();

    // log in

    await driver.get('https://doggos.herokuapp.com/login');

    await driver.findElement(By.name('email')).sendKeys(test_email, Key.TAB);

    await driver.findElement(By.name('password')).sendKeys(test_password, Key.ENTER);

    // click edit profile button

    let editProfileButton = driver.findElement(By.linkText('Edit Profile'));

    const actions = driver.actions({async: true});

    await actions.move({origin:editProfileButton}).press().perform();

    await actions.move({origin:editProfileButton}).release().perform();

    // enter new information and save 

    await driver.findElement(By.name('firstname')).sendKeys(test_pet_first_name, Key.TAB);

    await driver.findElement(By.name('lastname')).sendKeys(test_pet_last_name, Key.TAB);

    await driver.findElement(By.name('breed')).sendKeys(test_pet_breed, Key.TAB);

    await driver.findElement(By.name('gender')).sendKeys(test_pet_gender, Key.TAB);

    await driver.findElement(By.name('bio')).sendKeys(test_biography, Key.TAB, Key.ENTER);

    // check that the information was correctly saved

    await driver.get('https://doggos.herokuapp.com/profile');

    let all_profile_info = await driver.findElements(By.css('p'));

    var profile_biography = await all_profile_info[0].getText();
    // console.log(profile_biography);

    var profile_first_name = await all_profile_info[1].getText();
    profile_first_name = profile_first_name.slice(11).trim();
    // console.log(profile_first_name);

    var profile_last_name = await all_profile_info[2].getText();
    profile_last_name = profile_last_name.slice(10).trim();
    // console.log(profile_last_name);

    var profile_gender_breed = await all_profile_info[3].getText();
    profile_gender_breed = profile_gender_breed.split('|');
    
    var profile_breed = profile_gender_breed[0].trim();
    var profile_gender = profile_gender_breed[1].trim();

    profile_breed = profile_breed.slice(6).trim();
    profile_gender = profile_gender.slice(7).trim();
    // console.log(profile_gender);
    // console.log(profile_breed);

    if (profile_biography == test_biography && profile_first_name == test_pet_first_name && profile_last_name == test_pet_last_name && profile_breed == test_pet_breed && profile_gender == test_pet_gender){
        console.log("Profile information edited and saved successfully.");
    }else{
        console.log("Didn't edit or save profile information.");
    }

    driver.quit();
})();