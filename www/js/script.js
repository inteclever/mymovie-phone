

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
			var count = this.messages.length;
			this.messages.push({text:'Vanclav '+parseInt(count)+1, id:parseInt(count)+1});
		},
		reverse: function(){
			var oldMessages = this.messages;  
			var part = this.messages.slice(1,5);
			this.messages = part;
			for(item in oldMessages) this.messages.push({id:oldMessages[item].id, text:oldMessages[item].text});		
		}
	},
	
	computed: {
    },
    mounted() {
    }
})
var app2 = new Vue({
	el: '.authContainer',
	data: {
		valid: true,
		password: null, 
		passwordRules: [
			v => !!v || 'Обязательное поле',
			v => (v && v.length >= 5) || 'Пароль должен быть более 5 символов'
		],
		repassword: null,
		repasswordRules: [
			v => !!v || 'Обязательное поле',
			v => app2.password == app2.repassword || 'Должно совпадать с полем "Пароль"'
		],
		email: '',
		emailRules: [
			v => !!v || 'Обязательное поле',
			v => /.+@.+/.test(v) || 'Пожалуйста, введите email'
		],
		checkbox: false,
		retryPasswordFlag: false, 
		formLabel: "Авторизируйтесь",
		buttonSubmit: "Регистрация", 
		submitUrl: "auth"
	},
	methods:{
		submit () {
			if (this.$refs.form.validate()) {
				console.log(`Email: ${this.email} passwrod ${this.password} action: ${this.submitUrl}`);
				// Native form submission is not yet supported
					axios.get('http://quicknote.bget.ru/', {
						params:{
							email: this.email,
							password: this.password,
							action:this.submitUrl
						}
				}).then(response => {
					console.log(response.data);
					let request = response.data;
					if(data.status) sqLiteAddUser(data);
				}).catch(error => {					
					console.log(error);
				});
			}
		},
		clear () {
			this.$refs.form.reset()
		},
		registration (){
			this.buttonSubmit = (this.retryPasswordFlag) ? "Регистрация" : "Авторизация";
			this.formLabel = (this.retryPasswordFlag) ? "Авторизируйтесь" : "Зарегистрируйтесь";
			this.submitUrl = (this.retryPasswordFlag) ? "auth" : "addUser";
			this.retryPasswordFlag = !this.retryPasswordFlag;
		},
		sqLiteAddUser(data){
			
		}
	},
	
	computed: {
    },
    mounted() {
    }
})