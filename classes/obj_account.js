export default class obj_account {
	constructor(id, login, password) {
		this.id = id;
		this.login = login;
		this.password = password;
	}
	
	get() {
		return({
			id: this.id,
			login: this.login,
			password: this.password
		});
	}
}