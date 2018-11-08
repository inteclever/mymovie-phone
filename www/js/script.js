
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
			console.log('chaah');
			var count = this.messages.length;
			this.messages.push({text:'Vanclav '+parseInt(count)+1, id:parseInt(count)+1});
		},
		reverse: function(){
			var oldMessages = this.messages;  
			var part = this.messages.slice(1,5);
			this.messages = part;
			console.log(oldMessages);
			for(item in oldMessages) this.messages.push({id:oldMessages[item].id, text:oldMessages[item].text});		
		}
		//openMenu: function(){this.menu_enable = (this.menu_enable)?false:true; console.log(this.menu_enable);}
	},
	
	computed: {
    },
    mounted() {
    }
})
var app = new Vue({
	el: '.authContainer',
	data: {
		valid: true,
		passwordRules: [
			v => !!v || 'Обязательное поле',
			v => (v && v.length >= 5) || 'Пароль должен быть более 5 символов'
		],
		email: '',
		emailRules: [
			v => !!v || 'Обязательное поле',
			v => /.+@.+/.test(v) || 'Пожалуйста, введите email'
		]
	},
	methods:{
		submit () {
			if (this.$refs.form.validate()) {
				// Native form submission is not yet supported
					axios.post('/api/submit', {
					email: this.email,
					password: this.password
				})
			}
		},
		clear () {
			this.$refs.form.reset()
		}
	},
	
	computed: {
    },
    mounted() {
    }
})