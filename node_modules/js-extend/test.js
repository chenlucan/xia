var require = require || this.requires;

if(require) {
	var extend = require('./index').extend;
}

var obj1 = { name: "Vitor" };
var obj2 = { lastName: "Mattos" };

extend(obj1, obj2);

console.log(obj1);

var obj3 = { age: 20 };
var obj4 = { 
	nestedObject: {
		gender: 'male',

		thirdLevelObject: {
			value: 300
		}
	}
};

extend(obj1, obj3, obj4);

console.dir(obj1);

var obj5 = {
	nestedObject: {
		fifthValue: "five", 

		thirdLevelObject: {
			num: 59
		}
	}
}

extend(obj1, obj5);

console.dir(obj1);