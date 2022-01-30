const {Builder, By, Key, locateWith, below} = require('selenium-webdriver');

var email = "match@script.com";
var password = "123";


(async function match_test() {
    let driver = await new Builder().forBrowser('chrome').build();

    //log in

    await driver.get('https://doggos.herokuapp.com/login');

    await driver.findElement(By.name('email')).sendKeys(email, Key.TAB);

    await driver.findElement(By.name('password')).sendKeys(password, Key.ENTER);

    //go to explore page

    await driver.get('https://doggos.herokuapp.com/explore_matches');

    //get the name of the first potential match

    let all_potential_matches = await driver.findElements(By.css('li'));

    var name = await all_potential_matches[4].getText();

    var temp_name = name.split('\n');

    var accepted_match_full_name = temp_name[0].slice(12);

    accepted_match_full_name = accepted_match_full_name.split(',');

    // console.log(accepted_match_full_name);

    //accept the first potential match

    let acceptButton = await driver.findElements(By.css('button'));

    const actions = driver.actions({async: true});

    await actions.move({origin:acceptButton[1]}).press().perform();

    await actions.move({origin:acceptButton[1]}).release().perform();

    //go to matches page and verify that the accepted match is there

    await driver.get('https://doggos.herokuapp.com/explore');

    var current_url = await driver.getCurrentUrl();

    if (current_url != 'https://doggos.herokuapp.com/explore'){
        console.log('Matches page is empty');
    }

    let matched_users = await driver.findElements(By.css('li'));

    var matched_located = false;

    for (var i = 4; i < matched_users.length; i++){
        var matched_name = await matched_users[i].getText();

        var temp_matched_name = matched_name.split('\n');
        var matched_full_name = temp_matched_name[0].slice(5);

        // console.log(matched_full_name);
        matched_full_name = matched_full_name.split(',');


        if (matched_full_name[0].trim() == accepted_match_full_name[0].trim() && matched_full_name[1].trim() == accepted_match_full_name[1].trim()){
            // console.log(matched_full_name);
            // console.log('in here');
            matched_located = true;
        }
    }

    if (matched_located){
        console.log("Match has been found");
    }else{
        console.log("Didn't find the newly accepted match");
    }

    driver.quit();
})();