const {Builder, By, Key} = require('selenium-webdriver');

var email = "script@test.com";
var password = "123";


(async function match_test() {
    let driver = await new Builder().forBrowser('chrome').build();

    //log in

    await driver.get('https://doggos.herokuapp.com/login');

    await driver.findElement(By.name('email')).sendKeys(email, Key.TAB);

    await driver.findElement(By.name('password')).sendKeys(password, Key.ENTER);

    //go to blocked page

    await driver.get('https://doggos.herokuapp.com/blocked');

    //get the name of the first blocked

    let all_blocks = await driver.findElements(By.css('li'));

    var name = await all_blocks[5].getText();

    var temp_name = name.split('\n');

    var blocked_person_full_name = temp_name[0].slice(5);

    blocked_person_full_name = blocked_person_full_name.split(',');

    // unblock the first person on the page

    let unblockButton = await driver.findElements(By.css('button'));

    const actions = driver.actions({async: true});

    await actions.move({origin:unblockButton[2]}).press().perform();

    await actions.move({origin:unblockButton[2]}).release().perform();

    //check that the blocked person is gone from blocked page

    // await driver.navigate().refresh();

    let block_list = await driver.findElements(By.css('li'));

    var unblock_target_located = false;

    for (var i = 5; i<block_list.length; i++){
        var person_name = await block_list[i].getText();
        person_name = person_name.split('\n');
        person_full_name = person_name[0].slice(5);
        person_full_name = person_full_name.split(',');

        if (blocked_person_full_name[0].trim() == person_full_name[0].trim() && blocked_person_full_name[1].trim() == person_full_name[1].trim()){
            unblock_target_located = true;
        }
    }

    if (unblock_target_located){
        console.log("Unblock didn't work. Person still in blocked page.");
    }else{
        console.log("Person is not in blocked page anymore");
    }

    //go to explore page and verify that the unblocked person is there

    await driver.get('https://doggos.herokuapp.com/explore_matches');

    let potential_matches = await driver.findElements(By.css('li'));

    var unblocked_located = false;

    for (var i = 5; i < potential_matches.length; i++){
        var match_name = await potential_matches[i].getText();

        var temp_match_name = match_name.split('\n');
        var match_full_name = temp_match_name[0].slice(12);

        match_full_name = match_full_name.split(',');


        if (match_full_name[0].trim() == blocked_person_full_name[0].trim() && match_full_name[1].trim() == blocked_person_full_name[1].trim()){
            unblocked_located = true;
        }
    }

    if (unblocked_located){
        console.log("Unblocked person has been found in explore page");
    }else{
        console.log("Didn't find the unblocked user in explore page");
    }

    driver.quit();
})();