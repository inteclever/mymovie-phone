

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
			{name:'Мои сериалы', id:3, icon:'personal_video', href:'movieList.html'}
		],
		menuContext:[
			{name:'Выйти', id:1},
			{name:'Закрыть', id:2}
		],
		/* container for film list of user*/
		films:[],
		searchedFilms:[],
		menuItem_class:'menu-item',
		htmlRequest: null,
		showCards: true,
		enableSearchMovieButton: false,
		searchMovieButtonName: "Найти фильм",
		filmsLoadingButton: "Подождите, загружаю схожие фильмы...",
		description: ""
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
		/* Add new film or serial to data base 
		saveMovie(){
			app.enableAddMovieButton = true;
			app.addMovieButtonName = "Ожидайте..";
			if (this.typeMovieSelected && this.movieName) {
				// Native form submission is not yet supported
				axios.get('http://quicknote.bget.ru/', {
					params:{
						id_user: this.userData.id,
						id_type: this.typeMovieSelected,
						movie_name: this.movieName,
						action:'addMovie'
					}
				}).then(response => {
					console.log(response);
					let request = response.data;
					this.htmlRequest = response.data.info;
					app.enableAddMovieButton = false;
					app.addMovieButtonName = "Добавить";
				}).catch(error => {					
					console.log(error);
					app.enableAddMovieButton = false;
					app.addMovieButtonName = "Добавить";
				});
			}else{
				console.log(this.$refs);
				app.enableAddMovieButton = false;
			}
		},*/
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
				console.log(request);
				app.films = request.list;
				this.htmlRequest = response.data.info;
			}).catch(error => {					
				console.log(error);
			});
		},
		searchFilm(name){
			console.log(name);
			this.searchedFilms = [];
			this.showCards = !this.showCards;
			axios.get('http://quicknote.bget.ru/', {
				params:{
					key: name,
					action:'getFilm'
				}
			}).then(response => {
				this.searchedFilms = response.data;
				this.filmsLoadingButton = "Назад";
				console.log(response.data);
				//this.htmlRequest = response.data.info;
			}).catch(error => {					
				console.log(error);
			});
		},
		getDescriptionFilm(url, idFilm){
			axios.get('http://quicknote.bget.ru/', {
				params:{
					url: url,
					action:'getDescription'
				}
			}).then(response => {
				console.log(response.data);
				//film_description = response.data.description;
				//document.getElementById(idFilm).innerHTML = response.data.description;
				this.searchedFilms[idFilm].description = response.data.description;
			}).catch(error => {					
				console.log(error);
			});			
		}
	},
	
	computed: {
    },
    mounted() {
		this.checkLogin()
    }
})
