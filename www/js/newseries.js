

Vue.component('menu-items',{
	props:['name'],
	template:'<span>{{name}}</span>'
});
Vue.component('types-list',{
	props:['type'],
	template:'<option >{{type}}</option>'
});
Vue.component('block-page',{
  template: './templates/addMovie.vue'
})

var app = new Vue({
	el: '.movieContainer',
	data: {
		db: window.openDatabase("Database", "1.0", "mymoviedb", 200000),
		userData: {},
		onlyNumbers: [v => (v && v.length > 0 && v.length <= 3) || 'Введите название фильма'],
		menuEnable: null, // close or open main menu
		menu:[
			{name:'Добавить фльм', id:1, icon:'add_circle_outline', href:'addMovie.html'},
			{name:'Мои фильмы', id:2, icon:'ondemand_video', href:'movieList.html'},
			{name:'Мои сериалы', id:3, icon:'personal_video', href:'serialList.html'},
			{name:'Как пользоваться', id:4, icon:'list', href:'howtouse.html'},
			{name:'Новые серии', id:5, icon:'priority_high', href:'newseries.html'}
		],
		menuContext:[
			{name:'Выйти', id:1},
			{name:'Закрыть', id:2}
		],
		weekDays:[
			{name:"Понедельник", tzName:"Monday", id:1, today:false},
			{name:"Вторник", tzName:"Tuesday", id:2, today:false},
			{name:"Среда", tzName:"Wednesday", id:3, today:false},
			{name:"Четверг", tzName:"Thursday", id:4, today:false},
			{name:"Пятница", tzName:"Friday", id:5, today:false},
			{name:"Суббота", tzName:"Saturday", id:6, today:false},
			{name:"Воскресенье", tzName:"Sunday", id:7, today:false}
		],
		headers: [
			{text: 'Название', value: 'name'},
			{text: 'Дата послед. просмотра', value: 'date', align:'center' },
			{text: 'Просмотрено', value: 'count', align:'center'}
		],
		weekDaysSelected:null, 
		manySeries:null,
		/* container for film list of user*/
		films:[],
		searchedFilms:[],
		selectedSearchFilm: null,
		menuItem_class:'menu-item',
		htmlRequest: null,
		showCards: true,
		enableSearchMovieButton: false,
		searchMovieButtonName: "Найти сериал",
		filmsLoadingButton: "Подождите, загружаю схожие фильмы...",
		searchMessage: "Список найденых фильмов",
		description: "",
		seenStyle: null,
		toBufferClipBoard: null,
	},
	methods:{
		getToday(){
			var date = new Date();
			this.weekDays[parseInt(date.getDay()) - parseInt(1)].today = true;
			this.weekDaysSelected = this.weekDays[parseInt(date.getDay()) - parseInt(1)].name;
		},
		/* Click right up context menu. Events. */
		clickContextMenu(id){
			if(id == 1){
				/* IF USER CLICK EXIT ON CONTEXT MENU */
				this.db.transaction(function(tx){
					tx.executeSql('DROP TABLE IF EXISTS users');
					window.location.replace("index.html");	
				});			
			}else if(id == 2){
				
			}
		},
		/* DELETE MOVIE FROM DATA BASE */
		deleteFromList(id, counter){
			axios.get('http://quicknote.bget.ru/', {
				params:{
					id_film: id,
					id_user: this.userData.id,
					action:'deleteFilm'
				}
			}).then(response => {
				
				let request = response.data;
				if(request.status) this.films.splice(counter, 1);
				
			}).catch(error => {					
				console.log(error);
			});
		},
		/* GET USER DATA FROM SQLITE */
		checkLogin(){
			try{				
				this.db.transaction(function(tx){	
					tx.executeSql('SELECT * FROM users', [], 
					function(tx, result){
						app.userData = result.rows[0];
						app.getListFilm();
					}, null);	
				}, this.errorCB, null)	
			}catch(ex){ console.log('AUTH ERROR: '+ex);	}			
		},
		/* GET LIST OF FILMS */
		getListFilm(){
			axios.get('http://quicknote.bget.ru/', {
				params:{
					id_user: this.userData.id,
					type: "serial",
					action: 'getListFilm'
				}
			}).then(response => {
				let request = response.data;
				app.films = request.list;
				this.htmlRequest = response.data.info;
			}).catch(error => {					
				console.log(error);
			});
		},
		searchFilm(name, id_film){
			this.searchedFilms = [];
			this.searchMessage = null;
			this.showCards = !this.showCards;
			axios.get('http://quicknote.bget.ru/', {
				params:{
					key: name,
					action:'getFilm'
				}
			}).then(response => {
				this.searchedFilms = response.data;
				this.searchMessage = (this.searchedFilms.length == 0) ? "К соажлению, поиск не дал результатов. Попробуйте указать более точное название фильма или добавить к названию год выпуска" : this.searchMessage;
				this.filmsLoadingButton = "Назад";
				this.selectedSearchFilm = id_film;
			}).catch(error => {					
				console.log(error);
			});
		},
		bindMovie(film, idFilm){
			axios.get('http://quicknote.bget.ru/', {
				params:{
					id_user: this.userData.id,
					id_film: this.selectedSearchFilm,
					description: film.description,
					kp_id: film.id,
					img: film.imgSrc,
					name: film.name,
					rating: film.rating,
					url: film.url,
					date: film.date,
					action:'bindMovie'
				}
			}).then(response => {
				let request = response.data;
				app.films = request.list;
				this.htmlRequest = response.data.info;
				document.getElementById('textfilm-'+idFilm).innerHTML = response.data.info;
			}).catch(error => {					
				console.log(error);
			});
		},
		getDescriptionFilm(url, idFilm){
			document.getElementById('describe-'+idFilm).innerHTML = "Загружаю...";
			axios.get('http://quicknote.bget.ru/', {
				params:{
					url: url,
					action:'getDescription'
				}
			}).then(response => {
				//film_description = response.data.description;
				//document.getElementById(idFilm).innerHTML = response.data.description;
				this.searchedFilms[idFilm].description = response.data.description;
				document.getElementById('describe-'+idFilm).style.display="none";
			}).catch(error => {					
				console.log(error);
				document.getElementById('describe-'+idFilm).innerHTML = "Ошибка, попробуйте позже";
			});			
		},
		seenMovie(id_film, counter){
			console.log(`id film: ${id_film} id user ${this.userData.id} counter: ${counter}`);
			axios.get('http://quicknote.bget.ru/', {
				params:{
					id_film: id_film,
					id_user: this.userData.id,
					action:'seenFilm'
				}
			}).then(response => {				
				let request = response.data;
				if(request.status) this.films[counter].seen = 1;
				
			}).catch(error => {					
				console.log(error);
			});
		},
		shareMovie(token) {
			this.toBufferClipBoard = "https://whatsee.ru/?action=showFilmInfo&token="+token;
			let testingCodeToCopy = document.querySelector('#testing-code');
			testingCodeToCopy.value = this.toBufferClipBoard;
			testingCodeToCopy.setAttribute('type', 'text');
			testingCodeToCopy.select();

			try {
				var successful = document.execCommand('copy');
				this.copyMessage = "Ссылка на фильм скопирована в буфер обмена";
			} catch (err) {
				this.copyMessage = "При копировании сылки произошла ошибка, попробуйте еще раз!";
			}

			/* unselect the range */
			testingCodeToCopy.setAttribute('type', 'hidden');
			window.getSelection().removeAllRanges();
			
        }
	},
	
	computed: {
    },
    mounted() {
		this.checkLogin();
		this.getToday();
    }
})
