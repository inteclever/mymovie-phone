

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
		menuEnable: null, // close or open main menu
		menu:[
			{name:'Добавить фльм', id:1, icon:'add_circle_outline', href:'addMovie.html'},
			{name:'Мои фильмы', id:2, icon:'ondemand_video', href:'movieList.html'},
			{name:'Мои сериалы', id:3, icon:'personal_video', href:'serialList.html'}
		],
		menuContext:[
			{name:'Выйти', id:1},
			{name:'Закрыть', id:2}
		],
		/* container for film list of user*/
		films:[],
		searchedFilms:[],
		selectedSearchFilm: null,
		menuItem_class:'menu-item',
		htmlRequest: null,
		showCards: true,
		enableSearchMovieButton: false,
		searchMovieButtonName: "Найти фильм",
		filmsLoadingButton: "Подождите, загружаю схожие фильмы...",
		searchMessage: "Список найденых фильмов",
		description: "",
		seenStyle: null,
		toBufferClipBoard: null,
		copyMessage: "Нажмите, что б скопировать ссылку в буфер обмена"
	},
	methods:{
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
			console.log(`id film: ${id} id user ${this.userData.id} counter: ${counter}`);
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
					action:'getListFilm'
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
			this.toBufferClipBoard = "https://quicknote.bget.ru/?action=showFilmInfo&token="+token;
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
		this.checkLogin()
    }
})
