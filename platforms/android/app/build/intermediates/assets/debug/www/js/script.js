

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
		typeMovieSelected:{name:'Фильм', id:1},
		typeMovie:[
			{name:'Фильм', id:1},
			{name:'Сериалы', id:2}
		],
		messages:[
			{text: 'Привет, Vue!', id:1},
			{text: 'Ты кто?', id:2}
		],
		menu:[
			{name:'Добавить фльм', id:1, icon:'add_circle_outline', href:'index.html'},
			{name:'Мои фильмы', id:2, icon:'ondemand_video', href:'movieList.html'},
			{name:'Мои сериалы', id:3, icon:'personal_video', href:'movieList.html'}
		],
		menuContext:[
			{name:'Выйти', id:1},
		],
		still: 'It still text',
		vunch_css:'block',
		menu_class:'menu',
		menuItem_class:'menu-item',
		menuEnable: null, // close or open main menu
		compiled: null
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
		clickContextMenu(id){
			if(id==1){
				this.db.transaction(function(tx){tx.executeSql('DROP TABLE IF EXISTS users');});
				window.location.replace("index.html");				
			}
		}
	},
	
	computed: {
    },
    mounted() {
    }
})
