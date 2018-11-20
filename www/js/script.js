

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
		movieNameRule: [v => (v && v.length > 0) || 'Введите название фильма'],
		typeMovieSelected:1,
		typeMovie:[
			{name:'Фильм', id:1},
			{name:'Сериал', id:2}
		],
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
		still: 'It still text',
		vunch_css:'block',
		menu_class:'menu',
		menuItem_class:'menu-item',
		movieName: null,
		menuEnable: null, // close or open main menu
		compiled: null, 
		htmlRequest: null,
		enableAddMovieButton: false,
		addMovieButtonName: "Добавить"
		
	},
	methods:{
		animation: function(){
			var count = this.messages.length;
			this.messages.push({text:'Vanclav '+parseInt(count)+1, id:parseInt(count)+1});
		},
		reverse: function(){
			var oldMessages = this.messages;  
			var part = this.messages.slice(1,5);
			this.messages = part;
			for(item in oldMessages) this.messages.push({id:oldMessages[item].id, text:oldMessages[item].text});		
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
		/* Add new film or serial to data base */
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
		},
		/* GET USER DATA FROM SQLITE */
		checkLogin(){
			try{				
				this.db.transaction(function(tx){	
					tx.executeSql('SELECT * FROM users', [], 
					function(tx, result){
						app.userData = result.rows[0];
					}, null);	
				}, this.errorCB, null)	
			}catch(ex){ console.log('AUTH ERROR: '+ex);	}			
		}
	},
	
	computed: {
    },
    mounted() {
		this.checkLogin()
    }
})
