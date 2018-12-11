//*Nutritionix API get request*//
function getFoodFromApi(query){
    $.getJSON(`https://api.nutritionix.com/v1_1/search/${query}?fields=item_name%2Citem_id%2Cbrand_name%2Cnf_calories%2Cnf_total_fat&appId=7bce997c&appKey=6b6f5f3f89d2ea6771584b78c450c19d`, (d)=>{
      state.searchItems = d.hits;
      console.log(d.hits);
      displayResults();
    });
  };
  
  //*State information*//
  const state = {
    weight: 0,
    sex: "",
    calCountSustain: 2000,
    calCountGain: 2000,
    calCountLose: 2000,
    goal: 2000,
    todaysCalIntakeTotal: 0,
    todaysCalIntake: [],
    searchItems: [],
    storedItems: []
  }
  
  
  //*State modifications and calculator functions*//
  const addItem = function(state, itemName, cal) {
    let itemObj = {itemName, cal};
    state.storedItems.push(itemObj);
    let numCal = cal.replace ( /[^0-9.]/g, '' );
    state.todaysCalIntake.push(+numCal);
  }
  
  const calculateCal = function(state){
    state.todaysCalIntakeTotal = state.todaysCalIntake.reduce(add, 0);
    function add (a,b) {
      return a + b;
    }
  }
  
  const removeItem = function(state, itemToRemove) {
    let normalizeRemoving = itemToRemove.trim().toLowerCase();
    state.storedItems.map(function(item, i){
      let normalizeName = item.itemName.trim().toLowerCase();
      if(normalizeName === normalizeRemoving){
        state.storedItems.splice(i, 1);
      }
    })
  }
  
  const removeCal = function(state, calCount) {
    state.todaysCalIntake.map(function(item, i){
      if (item === calCount) {
        state.todaysCalIntake.splice(i,1);
      }
    })
  }
  
  const userInputs = function(weight, sex, goal) {
    state.weight = weight;
    state.sex = sex;
    if (sex === "female") {
      state.calCountSustain = 10 * weight;
      state.calCountGain = (10 * weight) + 300;
      state.calCountLose = (10 * weight) - 200;
        if (goal === "maintain") {
          state.goal = (state.calCountSustain);
        }
        else if (goal === "gain") {
          state.goal = (state.calCountGain);
        }
        else {state.goal = state.calCountLose};
    }
    else {
      state.calCountSustain = 11 * weight;
      state.calCountGain = (11 * weight) + 500;
      state.calCountLose = (11 * weight) - 350;
        if (goal === "maintain") {
          state.goal = (state.calCountSustain);
        }
        else if (goal === "gain") {
          state.goal = (state.calCountGain);
        }
        else {state.goal = state.calCountLose};
    }
    displayUserCal();
  }
  
  const calculateCalIntake = function(cal) {
    console.log(cal);
    state.todaysCalIntake = state.todaysCalIntake + cal;
  }
  
  //*Render functions*//
  const displayCalCounter = function() {
    $('#calCounter').removeClass('hidden');
    $('#calCounter').html(
      `<p>G:${state.goal}<br>
       Cal:${state.todaysCalIntakeTotal}</p>`);
  }
  
  const displayUserCal = function() {
    $('.js-user').html(
      `<h1 class="header">User Stats:</h1>
       <div class="box">
        <h3>GOAL: ${state.goal} / ${state.todaysCalIntakeTotal}</h3>
        <h4>Gender: ${state.sex}</h4>
        <h4>Weight: ${state.weight}</h4>
        <p>Sustain: ${state.calCountSustain}</p>
        <p>Gain: ${state.calCountGain}</p>
        <p>Shred: ${state.calCountLose}</p>
       </div>`
    )
  }
  
  const displayTodaysMenu = function() {
    $('.js-todays-meals').html("");
    state.storedItems.map(function(item) {
    $('.js-todays-meals').append(
      `<div class= "mealBar">
          <p class"iName">${item.itemName}</p>
          <p class"iCal">${item.cal}</p>
          <button class= "delete"> Delete </button>
       </div>`)
    });
  }
  
  const displayResults = function() {
    $('.search-result-header').html(
      `<h4 class="header">Click the corresponding food to add it to your daily caloric total. Meals can be edited under the meal tracker in the menu.</h4>`
    );
    $('.js-search-results').html("");
    state.searchItems.map(function(item) {
    let items = item.fields;
    $('.js-search-results').append(
      ` <div class= "itemBar">
        <button class="select box">
          <h2 class= "title"> ${items.brand_name} ${items.item_name}</h2>
          <p class= "calories"> Calories: ${items.nf_calories} </p>
          <p> Serving Size: ${items.nf_serving_size_qty} ${items.nf_serving_size_unit} </p>
          <p> Total Fat: ${items.nf_total_fat} </p>
        </button>
       </div>`)
    });
  }
  
  const displayFinal = function() {
    $('.final-result').html("");
    $('.final-result').removeClass('hidden');
    $('.main').addClass('hidden');
    $('.final-result').html("");
    let finalResultMesg = `<h1>You have reached todays Goal!</h1>
        <h2>Todays Calories: ${state.todaysCalIntakeTotal}</h2>
        <h2>Todays Goal: ${state.goal}</h2>
        <button class= "reset">Reset</button>`
    $(finalResultMesg).appendTo('.final-result').addClass('animate');
  }
  
  const goalWatch = function() {
    if ( state.todaysCalIntakeTotal >= state.goal) {
      displayFinal();
    }
  }
  
  //*Event Listners*//
  function watchSubmit() {
    $('.js-search-form').submit(function(e) {
      e.preventDefault();
      let query = $(this).find('.js-query').val();
      getFoodFromApi(query);
      $(this).closest('form').find("input[type=text], textarea").val("");
    });
  }
    
    $('.setup').submit(function(e) {
      //console.log('blahblah')
      //alert('aefaef')
      e.preventDefault();
      let weight = $(this).find('.weight').val();
      let sex = $('input[name=gender]:checked').val();
      let goal = $('input[name=goal]:checked').val();
      userInputs(weight, sex, goal);
      displayCalCounter();
    });
    
  
  $('.js-search-results').on('click','.select', function(){
    addItem(state, 
    $(this).closest('div').find('.title').text(),
    $(this).closest('div').find('.calories').text());
    $(this).addClass('animate');
    calculateCal(state);
    displayTodaysMenu();
    displayUserCal();
    goalWatch();
    displayCalCounter();
  });
  
  $('div.js-todays-meals').on('click', 'button.delete', function(event){
    removeItem(state, 
    $(this).closest('div').children().eq(0).text());
    let calDelete = $(this).closest('div').children().eq(1).text();
    let numCal = calDelete.replace( /[^0-9.]/g, '' );
    removeCal(state, +numCal);
    calculateCal(state);
    displayTodaysMenu();
    displayUserCal();
    displayCalCounter();
  });
  
  
  $('.startpage').on('click', 'button.next', function(event){
    $('.main').removeClass('hidden');
    $('.startpage').addClass('hidden');
    $('.js-search-results').html("");
    displayCalCounter();
  });
  
  $('.menubar').on('click', 'p', function(event){
    $('.menubar').toggleClass('openmenubar');
    $('.nav-menu').toggleClass('hidden');
    $('#calCounter').toggleClass('hidden');
    $('#calCounter2').toggleClass('hidden');
    $('#calCounter2').html(
      `<p>G:${state.goal}<br>
       Cal:${state.todaysCalIntakeTotal}</p>`);
  })
  
  
  //*Navigation Menu functions*//
  $('.nav-menu').on('click', '#start', function(event){
    $('.intro').addClass('hidden');
    $('.main').addClass('hidden');
    $('.startpage').removeClass('hidden');
    $('.meals').addClass('hidden');
    $('.js-user').addClass('hidden');
    $('.menubar').toggleClass('openmenubar');
    $('.nav-menu').toggleClass('hidden');
    $('#calCounter2').toggleClass('hidden');
  })
  $('.nav-menu').on('click', '#info', function(event){
    $('.main').addClass('hidden');
    $('.startpage').addClass('hidden');
    $('.intro').removeClass('hidden');
    $('.meals').addClass('hidden');
    $('.js-user').addClass('hidden');
    $('.menubar').toggleClass('openmenubar');
    $('.nav-menu').toggleClass('hidden');
    $('#calCounter2').toggleClass('hidden');
  })
  $('.nav-menu').on('click', '#main', function(event){
    $('.main').removeClass('hidden');
    $('.startpage').addClass('hidden');
    $('.intro').addClass('hidden');
    $('.meals').addClass('hidden');
    $('.js-user').addClass('hidden');
    $('.menubar').toggleClass('openmenubar');
    $('.nav-menu').toggleClass('hidden');
    $('#calCounter2').toggleClass('hidden');
  })
  $('.nav-menu').on('click', '#meals', function(event){
    $('.meals').removeClass('hidden');
    $('.main').addClass('hidden');
    $('.startpage').addClass('hidden');
    $('.intro').addClass('hidden');
    $('.js-user').addClass('hidden');
    $('.menubar').toggleClass('openmenubar');
    $('.nav-menu').toggleClass('hidden');
    $('#calCounter2').toggleClass('hidden');
  })
  $('.nav-menu').on('click', '#stats', function(event){
    $('.js-user').removeClass('hidden');
    $('.meals').addClass('hidden');
    $('.main').addClass('hidden');
    $('.startpage').addClass('hidden');
    $('.intro').addClass('hidden');
    $('.menubar').toggleClass('openmenubar');
    $('.nav-menu').toggleClass('hidden');
    $('#calCounter2').toggleClass('hidden');
  })
  
  //*State Reset*//
  $('.final-result').on('click', 'button.reset', function(event){
    state.weight= 0;
    state.sex = "";
    state.calCountSustain = 2000;
    state.calCountGain = 2000;
    state.calCountLose = 2000;
    state.goal = 2000;
    state.todaysCalIntakeTotal = 0;
    state.todaysCalIntake = [];
    state.searchItems = [];
    state.storedItems = [];
    $('.js-todays-meals').html("");
    $('.js-search-results').html("");
    $('.js-user').html("")
    $('.startpage').removeClass('hidden');
    $('.final-result').addClass('hidden');
  })
  
  
  watchSubmit();