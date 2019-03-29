let  connection = require('../config/database')

class Produit{

	static all (cb) {

		connection.query('SELECT * FROM categories',(err ,rows) => {
			if(err) throw err
			cb(rows)
		})
	}
	static items (id,cb){

		connection.query('SELECT * FROM items WHERE category=?',[id],(err ,rows) => {
			if(err) throw err
			cb(rows)
		})
	}
	static client (content ,cb) {
		connection.query('INSERT INTO commandes SET nomClient = ? ,prenomClient= ? , contactClient =?, pointLivraison = ?, totalPanier=?,dateCommande=?',[content.nom,content.prenom,content.contact,content.pointlivraison,content.total, new Date()],(err ,rows) => {
			if(err) throw err
			cb(rows)
		})
	}
	static recupid (cb){
		connection.query('SELECT id FROM commandes ORDER BY dateCommande DESC LIMIT 0,1 ',(err ,rows) => {
			if(err) throw err
			cb(rows)
		})
	}
	static panier (contenu ,cb) {
		connection.query('INSERT INTO paniercommandes SET nomProduit = ? ,prixProduit= ? , quantiteProduit =?,imageProduit=?, idClient = ?',[contenu.nomproduit,contenu.prix,contenu.quantite,contenu.image,contenu.id],(err ,rows) => {
			if(err) throw err
			cb(rows)
		})
	}
	
	static userCreation(info ,cb){
		    connection.query('INSERT INTO users SET login=? ,password=?',[info.nom,info.pass],(err ,rows) => {
			if(err) throw err
			cb(rows)
			})
	}
	static userLogin(cb){
		    connection.query('SELECT * FROM users ',(err ,rows) => {
			if(err) throw err
			cb(rows)
		    })	
	}
	static produitAll(index,cb){	   
	}
}
module.exports = Produit