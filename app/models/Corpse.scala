package models

import anorm._
import anorm.SqlParser._
import play.api.db.DB
import play.api.Play.current

case class Corpse (id: Pk[Long], bucketName: String)

object Corpse {

	val simple = {
		get[Pk[Long]]("id") ~
		get[String]("bucketName") map {
			case id ~ bucketName => Corpse(id, bucketName)
		}
	}

	def all (): Seq[Corpse] = {
		DB.withConnection { implicit connection =>
			SQL("select * from corpse").as(Corpse.simple *)
		}
	}

	def create (corpse: Corpse): Long = {
		DB.withConnection { implicit connection =>
			SQL("insert into corpse(bucketName) values ({bucketName})").on('bucketName -> corpse.bucketName).executeInsert()
		} match {
        	case Some(long) => long 
        	case None       => -1L
    	}
	} 


	def delete (corpse: Corpse) {
		DB.withConnection( implicit connection =>
			SQL("delete from corpse where id = {id}").on('id -> corpse.id).executeUpdate()
		)
	}

}