
var app2 = new Vue({
	el: '.authContainer',
	data: {
		db: window.openDatabase("Database", "1.0", "mymoviedb", 200000),
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
		submitUrl: "auth",
		request: "",
		autoauth: false,
		requestData: {},
		login: {}
	},
	methods:{		
		submit () {
			if (this.$refs.form.validate()) {
				// Native form submission is not yet supported
				axios.get('http://quicknote.bget.ru/', {
					params:{
						email: this.email,
						password: this.password,
						action:this.submitUrl
					}
				}).then(response => {
					console.log(response);
					let request = response.data;
					this.request = response.data.info;
					if(request.status && !this.retryPasswordFlag){
						this.requestData = request.data;
						this.sqLiteAddUser();
												
						/*
						*	REPLACE LOCATION 
						*	TO ADD MOVIE PAGE
						*/
						window.location.replace("addMovie.html");
						
					}else if(request.status && this.retryPasswordFlag){
						this.refreshDB();
					}
				}).catch(error => {					
					console.log(error);
					this.request = error.info;
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
			this.request = "";
		},
		refreshDB(){
			this.db.transaction(function(tx){tx.executeSql('DROP TABLE IF EXISTS users');});			
		},
		sqLiteAddUser(data){
			console.log('USER ID: '+this.requestData.id);
			var id = this.requestData.id;
			var login = this.requestData.login;
			var password = this.requestData.password;
			var auto = (!app2.autoauth)?0:1;
			this.db.transaction(function(tx, id, login, password){					
			
				tx.executeSql('DROP TABLE IF EXISTS users');
				tx.executeSql('CREATE TABLE IF NOT EXISTS users (id integer unique, login text, password text, auto integer)');
				tx.executeSql('INSERT INTO users (id, login, password, auto) VALUES(?,?,?, ?)', [parseInt(app2.requestData.id), app2.requestData.login, app2.requestData.password, parseInt(auto)]);					
			}, this.errorCB, this.successCB);			
		},
		errorCB(err) {
			//alert("Error processing SQL: "+err.code);
		},

		successCB() {
			//alert("success!");
		},
		isertedInDB(user) {			
			/* METHOD IF USER USE AUTO AUTHORIZATION */
			axios.get('http://quicknote.bget.ru/', {
				params:{
					email: user.login,
					password: user.password,
					action:'auth'
				}
			}).then(response => {
				console.log(response);
				let request = response.data;
				this.request = response.data.info;
				if(request.status ){
					/*
					*	REPLACE LOCATION 
					*	TO ADD MOVIE PAGE
					*/
					window.location.replace("addMovie.html");
				}
			}).catch(error => {					
				console.log(error);
				this.request = error.info;
			});
		},
		checkLogin(){
			try{				
				this.db.transaction(function(tx){	
					tx.executeSql('SELECT * FROM users', [], 
					function(tx, result){
						/* IF DATA ABOUT USER EXIST IN SQLITE */
						if(result.rows[0].auto == 1)
							app2.isertedInDB(result.rows[0]);
					}, null);	
				}, this.errorCB, null)	
			}catch(ex){ console.log('AUTH ERROR: '+ex);	}			
		}

	},
	
	computed: {
    },
    mounted() {
		this.checkLogin()
    },
	ready() {
	}
})