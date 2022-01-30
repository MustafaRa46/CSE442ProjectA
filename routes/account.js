const pool = require('../dbconfig');
var passwordHash = require('password-hash');
const imageUpload = require('../server');
const { render } = require('ejs');
exports.login = function(request, response){
    var browser_user = request.session.userId;
    message = '';
    var sess = request.session; 
    if(request.method == "POST" && browser_user == null){
        var post  = request.body;
        var username = post.email;
        var password= post.password;
        pool.query('SELECT * FROM public.user_accounts WHERE (email = $1);', [username], function(error, results, fields) {
            if (results.rowCount > 0) {
                if(passwordHash.verify(password,results.rows[0].password) === true){
                    request.session.userId = results.rows[0].account_id;
                    request.session.user = results[0];
                    response.redirect('profile');
                    response.end();
                }
                else{
                    message = "loginfail";
                    response.render('login',{message: message});
                }
         } 
         else{
             console.log("Erorr no email");
             message = "loginfail";
             response.render('login',{message: message});
         }			
         response.end();
     });
     } else if(request.method == "GET" && browser_user == null) {
         response.render('login');
     }
     else{
         response.redirect('/logout');
     }

    module.exports = message;
};

exports.index = function(request, response){
    response.render('/');
            
};

exports.logout=function(request,response){
    request.session.destroy(function(err) {
        response.redirect("/login");
    })
};



exports.signup = function(request, response){
    message = '';
    var sess = request.session; 
    if(request.method == "POST"){
       var post  = request.body;
       var email = post.email;
       var password= post.password;
       var firstname = post.firstname;
       var lastname= post.lastname;
       var ofirstname = post.ofirstname;
       var olastname= post.olastname;
       var profilepic = render('unnamed.png');
        pool.query('SELECT * FROM public.user_accounts WHERE (email = $1);', [email], function(error, results, fields) {
        if (results.rowCount > 0) {
            message = "signupfailedaccountexist";
            response.render("signup",{message:message});
        } else{

            pool.query('INSERT INTO public.user_accounts(email, password, first_Name, last_Name, owner_first_name, owner_last_name, profile_picture) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING account_id;', [email, passwordHash.generate(password),firstname,lastname,ofirstname,olastname, profilepic], function(error, results_3, fields) {
                console.log(passwordHash.generate(password));
                if (error) {
                    message = "signupfailedasomethingwentwrong";
                    response.render("signup",{message:message});
                }
                else{
                    message = "signupsuccess";
                    response.render('signup',{message: message});
                    // add (new user: existing user) and (existing user: new user) pairs to available table
                    pool.query('SELECT account_id, owner_first_name, owner_last_name FROM public.user_accounts WHERE (owner_first_name != $1 AND owner_last_name != $2);', [ofirstname, olastname], function(error, results, fields){
                        for (var i=0; i<results.rowCount; i++){
                            var existing_user_firstName = results.rows[i].owner_first_name;
                            var existing_user_lastName = results.rows[i].owner_last_name;
                            var existing_user_account_id = results.rows[i].account_id;
                            var browser_user = results_3.rows[0].account_id;
                            pool.query('SELECT account_id FROM public.user_accounts WHERE (email = $1);', [email], function(error, results_2, fields){
                               // browser_user = results_2.rows[0].account_id
                            });
                            console.log(browser_user);
                            // (new user: existing user)
                            pool.query('INSERT INTO public.available(user_first_name, user_last_name, potential_match_first_name, potential_match_last_name,potential_match_account_id,user_account_id) VALUES($1,$2,$3,$4,$5,$6);', [ofirstname, olastname, existing_user_firstName, existing_user_lastName,existing_user_account_id,browser_user], function(error, results, fields){
                                console.log(error);
                            });

                            // (existing user: new user)
                            pool.query('INSERT INTO public.available(user_first_name, user_last_name, potential_match_first_name, potential_match_last_name,potential_match_account_id,user_account_id) VALUES($1,$2,$3,$4,$5,$6);', [existing_user_firstName, existing_user_lastName, ofirstname, olastname,browser_user,existing_user_account_id], function(error, results, fields){
                                console.log(error)
                            });

                        }
                    });

                }
            });

        }			

    });
    } else {
        response.render('signup');
    }
    module.exports = message;       
};




exports.profile = function(request, response){
    var browser_user = request.session.userId;
    if(browser_user == null){
       response.redirect("/login");
    }
    else{

        if (request.body.profileFirstName != undefined && request.body.profileLastName != undefined){
            // if both not undefined then we're viewing someones profile
            pool.query('SELECT * FROM public.user_accounts WHERE (owner_first_name=$1 AND owner_last_name=$2);', [request.body.profileFirstName, request.body.profileLastName], function(error, results, fields){
                if (results.rowCount > 0){
                    response.render('profile2', {data: results.rows});
                }else{
                    response.send("error loading profile");
                }
                response.end()
            });

        }else{   
            // logging in
            pool.query('SELECT * FROM public.user_accounts WHERE (account_id=$1);', [browser_user], function(error, results, fields) {      
                if (results.rowCount > 0) {
                
                    message = "loginpass";
                    response.render('profile',{data: results.rows});
                } else{

                    response.redirect("/login");
                }			
                response.end();
            });
        }
    }           
};


exports.editprofile = function(request, response){
    message = '';
    var sess = request.session;
    var browser_user = request.session.userId;
    
    if(browser_user == null){
        response.redirect("/login");
    }
    if(request.method == "POST"){
        var post  = request.body;
        var firstname = post.firstname;
        var lastname= post.lastname;
        var breed = post.breed;
        var gender= post.gender;
        var bio= post.bio;
        if(firstname == ""){
            firstname = "Unknown";
        }
        if(lastname == ""){
            lastname = "Unknown";
        }
        if(breed == ""){
            breed = "Unknown";
        }
        if(gender == ""){
            gender = "Unknown";
        }
       pool.query('UPDATE public.user_accounts SET first_name= $1, last_name=$2, biography=$3, pet_gender=$4, pet_breed=$5 WHERE account_id = $6;', [firstname,lastname,bio,gender,breed,browser_user], function(error, results, fields) {
        if (error) {
            console.log(error);
            message = "profupdatefailed";
            response.render("editprofile",{message:message});
        }
        else{
            message = "profupdatesuccess";
            response.render('editprofile',{message: message});
        }		
        response.end();
    });
    } else {
        response.render('editprofile');
    }
    module.exports = message;
};

exports.changepass = function(request, response){
    message = '';
    var sess = request.session; 
    var browser_user = request.session.userId;

    if(request.method == "POST"){
       var post  = request.body;
       var email = post.email ;
       var password= post.password;
       var newpassword = post.newpassword;
       var newpasswordtwo = post.newpasswordtwo;
       //console.log(browser_user)
       //console.log(email)
        pool.query('SELECT * FROM public.user_accounts WHERE (account_id=$1);', [browser_user], function(error, results, fields) {
        if (results.rowCount > 0) {
            if(passwordHash.verify(password,results.rows[0].password) === true){
                
                if(newpassword === newpasswordtwo) {

                pool.query('UPDATE public.user_accounts SET password=$1 WHERE (account_id=$2);', [passwordHash.generate(newpassword), browser_user], function(error, results, fields) {
                    console.log(passwordHash.generate(newpassword))
                    if (error) {
                        console.log(error);
                        message = "fail here";
                        response.render("editprofile",{message:message});
                    }
                    else{
                        console.log(passwordHash.generate(newpassword))
                        message = "Password change was succesful";
                        response.render('editprofile',{message: message});
                       
                    }
                
                });
                message = "Password change was succesful"
                response.render('editprofile',{message: message});
                //console.log("here3")

                } else{
                //console.log("here55")
                message = "passwords dont match"
                response.render('editprofile',{message: message});
                //response.end();

                }

            } else {

            //console.log("here66")
            message = "Curr";//invalid current password
            response.render('editprofile',{message: message});

            }

        }

     });
    } else {
        console.log("here88888")
        message = "new passwords dont match"
        response.render('editprofile',{message: message});
    }
    module.exports = message;       
};

exports.explore = function(request, response){
    var browser_user = request.session.userId;
    if(browser_user == null){
       response.redirect("/login");
    }
    else{
    
        // get first and last name of current user (owner)
        pool.query('SELECT owner_first_name, owner_last_name FROM public.user_accounts WHERE account_id=$1;', [browser_user], function(error, results, fields){
            var first_name_owner = results.rows[0].owner_first_name;
            var last_name_owner = results.rows[0].owner_last_name;        

            
            pool.query('SELECT * FROM public.matches WHERE (matcher_first_name=$1 AND matcher_last_name=$2);', [first_name_owner, last_name_owner], function(error, results, fields) {      
                if (results.rowCount > 0) {
                    // console.log(results.rows[0].matched_id);
                    message = "loginpass";
                    response.render('explore',{data: results.rows});
                } else{

                    // make another page for no matches?
                    //response.send("No matches");
                     response.redirect("/explore_matches");
                }			
                response.end();
            });

        });
    }       
};
exports.blocked = function(request, response){
    var browser_user = request.session.userId;
    if(browser_user == null){
       response.redirect("/login");
    }
    else{
    
        // get first and last name of current user (owner)
        pool.query('SELECT owner_first_name, owner_last_name FROM public.user_accounts WHERE account_id=$1;', [browser_user], function(error, results, fields){
            var first_name_owner = results.rows[0].owner_first_name;
            var last_name_owner = results.rows[0].owner_last_name;        

            
            pool.query('SELECT * FROM public.blocked WHERE (matched_first_name=$1 AND matched_last_name=$2);', [first_name_owner, last_name_owner], function(error, results, fields) {      
                if (results.rowCount > 0) {
                    // console.log(results.rows[0].matched_id);
                    message = "loginpass";
                    response.render('blocked',{data: results.rows});
                } else{

                    // make another page for no matches?
                    //response.send("No matches");
                     response.redirect("/explore");
                }			
                response.end();
            });

        });
    }       
};
exports.matches_unblock = function(request, response){
    if (request.method == "POST"){
        // console.log(request.session)
        var matched_firstName = request.body.firstName;
        var matched_lastName = request.body.lastName;
        var matched_id = request.body.accountidsearched;
        //get users first and last name 
        var user_firstName = "";
        var user_lastName = "";
        pool.query('SELECT owner_first_name, owner_last_name FROM public.user_accounts WHERE account_id=$1', [request.session.userId], function(error, results, fields){
            // console.log(results.rows[0].first_name);
            // console.log(results.rows[0].last_name);
            user_firstName = results.rows[0].owner_first_name;
            user_lastName = results.rows[0].owner_last_name;
            //add this matching pair to the matches table
            pool.query('INSERT INTO public.available(user_first_name, user_last_name, potential_match_first_name, potential_match_last_name, potential_match_account_id, user_account_id) VALUES($1,$2,$3,$4,$5,$6)', [user_firstName, user_lastName, matched_firstName, matched_lastName, matched_id, request.session.userId], function(error, results, fields){
                //remove the matched pair from the available table
                pool.query('DELETE FROM public.blocked WHERE (matcher_id=$1 AND matched_id=$2 AND matched_first_name=$3 AND matched_last_name=$4 AND matcher_first_name=$5 AND matcher_last_name=$6)', [matched_id, request.session.userId, user_firstName, user_lastName, matched_firstName, matched_lastName], function(error, results, fields){ 
                    pool.query('UPDATE SET public.blocked WHERE (matcher_id=$1 AND matched_id=$2 AND matched_first_name=$3 AND matched_last_name=$4 AND matcher_first_name=$5 AND matcher_last_name=$6)', [matched_id, request.session.userId, user_firstName, user_lastName, matched_firstName, matched_lastName], function(error, results, fields){ 
                    });
                });

            });
            pool.query('SELECT * FROM public.blocked WHERE (matched_id=$1)', [request.session.userId], function(error, results, fields){
                response.render('blocked',{data: results.rows, message: 'unblocksuccess', unblockedname: matched_firstName + ',' + matched_lastName});
            });
        });
        //response.redirect("/blocked");


        
    }else{

        var browser_user = request.session.userId;
        // console.log(browser_user);
        if(browser_user == null){
            response.redirect("/login");
        }
    }        
};

exports.matches_block = function(request, response){
    if (request.method == "POST"){
        
        // console.log(request.session)
        var matched_firstName = request.body.firstName;
        var matched_lastName = request.body.lastName;
        var matched_id = request.body.accountidsearched;
        //get users first and last name 
        var user_firstName = "";
        var user_lastName = "";
        // console.log(matched_firstName)
        // console.log(matched_lastName)
        // console.log(matched_id)
        pool.query('SELECT owner_first_name, owner_last_name FROM public.user_accounts WHERE account_id=$1', [request.session.userId], function(error, results, fields){
            user_firstName = results.rows[0].owner_first_name;
            user_lastName = results.rows[0].owner_last_name;
            //add this matching pair to the matches table
            pool.query('INSERT INTO public.blocked(matcher_id, matched_id,matched_first_name, matched_last_name, matcher_first_name, matcher_last_name) VALUES($1,$2,$3,$4,$5,$6)', [request.session.userId,matched_id, matched_firstName, matched_lastName, user_firstName, user_lastName], function(error, results, fields){
                //remove the matched pair from the available table
                pool.query('DELETE FROM public.matches WHERE (matcher_id=$1 AND matched_id=$2 AND matched_first_name=$3 AND matched_last_name=$4 AND matcher_first_name=$5 AND matcher_last_name=$6)', [request.session.userId,matched_id, matched_firstName, matched_lastName, user_firstName, user_lastName], function(error, results, fields){ 
                });

            });

            //also add and remove the vice versa pairing
            pool.query('INSERT INTO public.blocked(matcher_id, matched_id, matched_first_name, matched_last_name, matcher_first_name, matcher_last_name) VALUES($1,$2,$3,$4,$5,$6);', [matched_id, request.session.userId, user_firstName, user_lastName, matched_firstName, matched_lastName], function(error, results, fields){
                pool.query('DELETE FROM public.matches WHERE (matcher_id=$1 AND matched_id=$2 AND matched_first_name=$3 AND matched_last_name=$4 AND matcher_first_name=$5 AND matcher_last_name=$6)', [request.session.userId,matched_id, matched_firstName, matched_lastName, user_firstName, user_lastName], function(error, results, fields){
                    pool.query('UPDATE SET public.matches WHERE (matcher_id=$1 AND matched_id=$2 AND matched_first_name=$3 AND matched_last_name=$4 AND matcher_first_name=$5 AND matcher_last_name=$6)', [request.session.userId,matched_id, matched_firstName, matched_lastName, user_firstName, user_lastName], function(error, results, fields){
                    });
                });
            });
            pool.query('SELECT * FROM public.matches WHERE (matcher_id=$1)', [request.session.userId], function(error, results, fields){
                response.render('explore',{data: results.rows, message: 'blocksuccess', blockedname: matched_firstName + ',' + matched_lastName});
            });

        });
        
        // response.redirect("./explore");

        
    }else{

        var browser_user = request.session.userId;
        // console.log(browser_user);
        if(browser_user == null){
            response.redirect("/login");
        }
        else{



            // get owner name of current user
            pool.query('SELECT owner_first_name, owner_last_name FROM public.user_accounts WHERE account_id=$1;', [browser_user], function(error, results, fields){
                var current_user_first_name = results.rows[0].owner_first_name;
                var current_user_last_name = results.rows[0].owner_last_name;
                
                // get all available pairings for the current user
                pool.query('SELECT potential_match_account_id, potential_match_first_name, potential_match_last_name FROM public.available WHERE (user_first_name=$1 AND user_last_name=$2);', [current_user_first_name, current_user_last_name], function(error, results, fields) {      
                    if (results.rowCount > 0) {            
                        response.render('explore_matches',{data: results.rows});
                    } else{

                        // need to do something else here
                        response.redirect("/profile");
                    }			
                    response.end();
                });

            });
        }
    }        
};
exports.home = function(request, response) {
    
    if(browser_user == null){
        response.redirect("/");
    }
    else {
        response.redirect("/home");
    }
}
exports.explore_matches = function(request, response){
    if (request.method == "POST"){
        
        // console.log(request.session)
        var matched_firstName = request.body.firstName;
        var matched_lastName = request.body.lastName;
        var matched_id = request.body.accountidsearched;
        //get users first and last name 
        var user_firstName = "";
        var user_lastName = "";
        pool.query('SELECT owner_first_name, owner_last_name FROM public.user_accounts WHERE account_id=$1', [request.session.userId], function(error, results, fields){
            // console.log(results.rows[0].first_name);
            // console.log(results.rows[0].last_name);
            user_firstName = results.rows[0].owner_first_name;
            user_lastName = results.rows[0].owner_last_name;
            
            //add this matching pair to the matches table
            pool.query('INSERT INTO public.matches(matcher_id, matched_id,matched_first_name, matched_last_name, matcher_first_name, matcher_last_name) VALUES($1,$2,$3,$4,$5,$6)', [request.session.userId,matched_id, matched_firstName, matched_lastName, user_firstName, user_lastName], function(error, results, fields){
                //remove the matched pair from the available table
                pool.query('DELETE FROM public.available WHERE (user_first_name=$1 AND user_last_name=$2 AND potential_match_first_name=$3 AND potential_match_last_name=$4 AND potential_match_account_id=$5 AND user_account_id=$6);', [user_firstName, user_lastName, matched_firstName, matched_lastName,matched_id,request.session.userId], function(error, results, fields){
                    pool.query('UPDATE SET public.available WHERE (user_first_name=$1 AND user_last_name=$2 AND potential_match_first_name=$3 AND potential_match_last_name=$4 AND potential_match_account_id=$5 AND user_account_id=$6);', [user_firstName, user_lastName, matched_firstName, matched_lastName,matched_id,request.session.userId], function(error, results, fields) {
                        
                    })
                    
                });

            });

            //also add and remove the vice versa pairing
            pool.query('INSERT INTO public.matches(matcher_id, matched_id, matched_first_name, matched_last_name, matcher_first_name, matcher_last_name) VALUES($1,$2,$3,$4,$5,$6);', [matched_id, request.session.userId, user_firstName, user_lastName, matched_firstName, matched_lastName], function(error, results, fields){
                pool.query('DELETE FROM public.available WHERE (user_first_name=$1 AND user_last_name=$2 AND potential_match_first_name=$3 AND potential_match_last_name=$4 AND potential_match_account_id =$5 AND user_account_id = $6);', [matched_firstName, matched_lastName, user_firstName, user_lastName, request.session.userId, matched_id], function(error, results, fields){
                    pool.query('UPDATE SET public.available WHERE (user_first_name=$1 AND user_last_name=$2 AND potential_match_first_name=$3 AND potential_match_last_name=$4 AND potential_match_account_id =$5 AND user_account_id = $6);', [user_firstName, user_lastName, matched_firstName, matched_lastName, request.session.userId,matched_id], function(error, results, fields) {
  
                    });
                });
            });
            pool.query('SELECT * FROM public.available WHERE (user_account_id=$1)', [request.session.userId], function(error, results, fields){
                message = "matchsuccess";
                response.render('explore_matches',{data: results.rows, message: message, acceptedname: matched_firstName + ',' + matched_lastName});
            });
        });
        


        
    }else{

        var browser_user = request.session.userId;
        // console.log(browser_user);
        if(browser_user == null){
            response.redirect("/login");
        }
        else{



            // get owner name of current user
            pool.query('SELECT owner_first_name, owner_last_name FROM public.user_accounts WHERE account_id=$1;', [browser_user], function(error, results, fields){
                var current_user_first_name = results.rows[0].owner_first_name;
                var current_user_last_name = results.rows[0].owner_last_name;
                
                // get all available pairings for the current user
                pool.query('SELECT potential_match_account_id, potential_match_first_name, potential_match_last_name FROM public.available WHERE (user_first_name=$1 AND user_last_name=$2);', [current_user_first_name, current_user_last_name], function(error, results, fields) {      
                    if (results.rowCount > 0) {            
                        response.render('explore_matches',{data: results.rows});
                    } else{

                        // need to do something else here
                        response.redirect("/profile");
                    }			
                    response.end();
                });

            });
        }
    }        
};


exports.search = function(request, response){
    var get = request.body;
    var id = get.accountidsearched;
    var browser_user = request.session.userId;
    if(browser_user == null){
        response.redirect("/login");
     }
    pool.query('SELECT * FROM public.user_accounts', function(error, results, fields) { 
        var array = []
        for (var i=0; i<results.rowCount; i++) {
            array.push(results.rows[i].account_id)
        }
        if (!array.includes(id)) {
            pool.query('SELECT owner_first_name, owner_last_name FROM public.user_accounts WHERE account_id=$1;', [browser_user], function(error, results, fields){
                var current_user_first_name = results.rows[0].owner_first_name;
                var current_user_last_name = results.rows[0].owner_last_name;
                
                // get all available pairings for the current user
                pool.query('SELECT potential_match_account_id, potential_match_first_name, potential_match_last_name FROM public.available WHERE (user_first_name=$1 AND user_last_name=$2);', [current_user_first_name, current_user_last_name], function(error, results, fields) {      
                    if (results.rowCount > 0) {            
                        response.render('explore_matches',{data: results.rows, message: 'searchfail'});
                    } else{

                        // need to do something else here
                        response.redirect("/profile");
                    }			
                    response.end();
                });

            });
        }
        else {
            pool.query('SELECT * FROM public.user_accounts WHERE (account_id = $1);', [id], function(error, results, fields) {   
                if (results.rowCount > 0) {
                    response.render('search',{data: results.rows});
                } else{
                    message = "Nouser";
                    response.redirect('profile');
                }			
                response.end();
            });
        }
    });

    
            
};
