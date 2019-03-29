require('babel-register')

let express = require('express')

let app = express()

let bodyParser = require('body-parser')

let session = require('express-session')

let Produit = require('./models/produit')


// Moteur de template
app.set('view engine', 'ejs')

// Middlware
app.use(express.static('public'))

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

app.use(session({
	secret:'azerty',
	unset:'destroy',
	resave :false,

	saveUnitialisezed:true,

	cookie:{ secure:false }
}))
app.use(function(request, response, next){
if (typeof(request.session.panier) == 'undefined') {
request.session.panier = [];
}
next();
})
app.use(function(request, response, next){
if (typeof(request.session.user) == 'undefined') {
request.session.user = [];
}
next();
})

// les Routes
app.get('/market.ejs', (request, response) => {
        Produit.all(function(items) {
       	response.render('pages/market' ,{items:items})
    })
})
app.post('/market.ejs',function(request, response) {
		if (request.body.id !='') {
			Produit.items(request.body.id,function(items){
			response.render('pages/catalogue',{items:items})
			})
		}
})
// gestion du panier [ cette section permet d'ajouter des elements dans le panier]
app.post('/catalogue.ejs', function(request, response) {
	if (request.body) {
	let nom = request.body.nom

	let prix = parseFloat(request.body.prix)

	let images= request.body.images

	let quantite = parseFloat(request.body.quantite)

	let id = request.body.id

	// ici je definis un objet panier
	let panier = {
		nom:nom,
		prix:prix,
		quantite:quantite,
		images:images,
		id:id,
	};

	// ici je verifie si un produit est deja dans le panier si c'est le cas j'augmente sa quantité sinon je l'ajoute
	let nouveauProduit = true
	request.session.panier.forEach(function(v){
		if(v.id == id){
		 nouveauProduit=false
		 v.quantite +=quantite
		}
	})
	if(nouveauProduit){
	request.session.panier.push(panier)
	}
	}
	response.redirect('/panier.ejs');
	})
app.get('/panier.ejs', (request, response) =>{
response.render('pages/panier' ,{panier: request.session.panier})
})
app.get('/panier/commander/market.ejs',function(request,response){
	response.redirect('/market.ejs')
})
// vider le panier (supprime tous les elements du panier)
app.post('/panier.ejs', function(request, response) {
	if (request.body.nom == 'vider') {
	request.session.panier= []
	response.redirect('/panier.ejs')
	}
	})
// supprimeer un element dans le panier
app.get('/panier/supprimer/:id',function(request, response) {
		if (request.params.id !='') {
		request.session.panier.splice(request.params.id,1);
		}
		response.redirect('/panier.ejs')
})
// enregistrer les commandes dans la base de donnee
app.post('/panier/commander/', function(request,response){
		if(request.body!=undefined){
			request.session.error ='Echec de la commande veuillez remplir correctement le formulaire'
			let pasErreur = true
			let nom = request.body.nom
			let prenom = request.body.prenom
			let contact = request.body.contact
			let pointlivraison=request.body.pointlivraison
			let total = request.body.totalpanier
			if(nom ===''){
				pasErreur=false
			}
			if(prenom ===''){
				pasErreur=false
			}
			if(contact ===''){
				pasErreur=false
			}
			if(pointlivraison==''){
				pasErreur=false
			}
			 if(!pasErreur){
			 	let etat= 'erreur'
			 	response.render('pages/panier' ,{etat:etat})
			 	console.log(request.session.panier)
			 }
			if(pasErreur){
				let content={
				nom:nom,
				prenom:prenom,
				contact:contact,
				pointlivraison:pointlivraison,
				total:total
			};
			Produit.client(content, function(){
    		})
			Produit.recupid(function(items) {
				let clientid
				for(i in items){
					clientid = items[i]
				}
				var id=clientid.id
				    request.session.panier.forEach(function(v){
				    	let nomproduit = v.nom
				    	let prix = v.prix
				    	let quantite= v.quantite
				    	let image = v.images
				    	let contenu= {
				    		nomproduit:nomproduit,
				    		prix:prix,
				    		quantite:quantite,
				    		image:image,
				    		id:id
				    	};
				    	Produit.panier(contenu, function(){
    					})
			        })
             })
			let etat = 'success'
			 response.render('pages/panier' ,{etat:etat})
			}
}
})
app.get('/etat.ejs',function(request,response){
})
// *ADMINSTRATION*......DEBUT.....
app.get('/login.ejs',function(request,response){
	response.render('pages/login')

})
app.get('/creation.ejs',function(request,response){
	response.render('pages/creation')
})
//CETTE PARTIE CONCERNE LA CONNEXION D'UN ADMINISTRATEUR
app.post('/login.ejs' ,function(request,response){
if(request.body.nomLogin !='' && request.body.passwordLogin!=''){
	
		let connect 
		let usernom=request.body.nomLogin
		let userpass = request.body.passwordLogin
		let verification
		let login
		let password
		let connecte
		Produit.userLogin(function(user){
			for(i in user){
				verification=user[i]
				if(verification.login==usernom && verification.password==userpass)
				{ 
					login=verification.login
					password = verification.password
					let infoUser={
						login:login,
						password:password
					};

					request.session.user.push(infoUser)
					connect = request.session.user
					for(i in connect){
						connecte=connect[i]
					}
				}
			}
			response.render('pages/admin',{connecte:connecte})
		})
		
		
	}
})
//FIN .....
// CREATION D'UN NOUVEAU COMPTE ADMIN
app.post('/creation.ejs',function(request,response){
	if(request.body.nom !=''&& request.body.password!=''){
		let nom=request.body.nom
		let pass=request.body.password
		let nouveaucompte =true
		let verify
		let info={
			nom:nom,
			pass:pass
		};
		Produit.userLogin(function(user){
			for(i in user){
				verify=user[i]
				if(verify.login==nom && verify.password==pass)
				{
				 nouveaucompte= false
				}
			}
			if(nouveaucompte){
			Produit.userCreation(info, function(){	
			response.render('pages/creation',{success:'votre compte a éte créé'})
			})
		    }else{
		     response.render('pages/creation',{echec:'ce nom utilisateur n\'est pas disponible '})
		    }
		})
	}
})
// FIN ......
//FIN ADMINISTRATION
app.get('/admin.ejs',function(request,response){	
})
app.post('/admin.ejs',function(request,response){
	if(request.body.champ='categorie'){
		Produit.all(function(categorie){
		response.render('pages/admin',{categorie:categorie})
		})
	}
})
app.listen(8080 ,() => {
	console.log('Le serveur a bien demaré sur le port 8080 ...')
})
