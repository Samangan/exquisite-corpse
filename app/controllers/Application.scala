package controllers

import play.api._
import play.api.libs.json.Json
import anorm.NotAssigned
import play.api.mvc._
import models._
import fly.play.s3._
import org.apache.commons.codec.binary.Base64
import java.io.File
import scala.concurrent.Await
import scala.concurrent.Future
import scala.concurrent.duration._

import java.awt.image.CropImageFilter;
import java.awt.image.FilteredImageSource;
import java.awt.Image;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.ByteArrayInputStream;
import java.awt.Graphics;

object Application extends Controller {

  def index = Action {
    Ok(views.html.drawCorpse())
  }

  def about = Action {
    Ok(views.html.about())
  }

  //POST /corpse
  def createNewCorpse = Action (parse.json) { implicit request =>
  	val newCorpseID = Corpse.create(Corpse(NotAssigned, "ex-corpse"))

    
    if(newCorpseID == -1) {
      return BadRequest()
    }

  	var encodedCorpseImg= Json.fromJson [String](request.body \ "body").get

    encodedCorpseImg = encodedCorpseImg.substring(22, encodedCorpseImg.length) // remove data:image/png;base64,

  	println("Added new corpse: " + newCorpseID)

    val bucket = S3("ex-corpse")

    val result = bucket add BucketFile( newCorpseID + ".png", "image/png", new Base64().decode(encodedCorpseImg.getBytes), None, None)

    //Send the newly made corpseId so that js can put the link to GET /corpse/:id on te page for the user to send/click
    Ok(Json.toJson(newCorpseID))
  }

  //GET /corpse/:id
  def getCorpse (id: Long) = Action { implicit request =>
    val bucket = S3("ex-corpse")

    val result = bucket get id + ".png"

    val file = Await.result(result, 10 seconds)

    val imageData =  file match {
        case BucketFile(name, contentType, content, acl, headers) => content
    }

    var img: BufferedImage = ImageIO.read(new ByteArrayInputStream(imageData))
    val x = img.getWidth - 50 
    val y = 0
    val w = 50 
    val h = img.getHeight 

    img = img.getSubimage(x, y, w, h)    

    val baos: ByteArrayOutputStream = new ByteArrayOutputStream()
    ImageIO.write(img, "png", baos)
    baos.flush()
    val imageInByte: Array[Byte] = baos.toByteArray()
    baos.close()

    val imageString = "data:image/png;base64," + new String(Base64.encodeBase64(imageInByte)) 

    Ok(views.html.addToCorpse(imageString))
  }

  //GET /corpses

  //TODO: return a list of all the nextRegions (pagination?)
  def getCorpses = TODO


  //PUT /corpse/:id
  def addNewRegionToCorpse (id: Long) = Action (parse.json) { implicit request =>
    val bucket = S3("ex-corpse")

    val result = bucket get id + ".png"

    val file = Await.result(result, 10 seconds)

    val imageData =  file match {
      case BucketFile(name, contentType, content, acl, headers) => content
    }

    var img: BufferedImage = ImageIO.read(new ByteArrayInputStream(imageData))
    val imgWidth = img.getWidth
    val imgHeight = img.getHeight

    //concat newRegion with image
    val width = imgWidth + 400 // 400 is the width of the new image 
    val height = imgHeight
    var resultImg: BufferedImage = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB)
    var g: Graphics = resultImg.getGraphics()

    var newRegion = Json.fromJson [String](request.body \ "body").get

    newRegion = newRegion.substring(22, newRegion.length) // remove data:image/png;base64,

    var newRegionImg:BufferedImage =  ImageIO.read(new ByteArrayInputStream(new Base64().decode(newRegion.getBytes)))
    //add newRegion to oldRegion
    g.drawImage(img, 0, 0, null)
    g.drawImage(newRegionImg, imgWidth, 0, null)

    //write to ByteArrayOutputStream
    val baos: ByteArrayOutputStream = new ByteArrayOutputStream()    
    ImageIO.write(resultImg, "png", baos)

    //save new image to s3 bucket
    val addResult = bucket add BucketFile( id + ".png", "image/png", baos.toByteArray , None, None)

    Ok(Json.toJson(id))
  }

  //GET     /corpse/complete/:id 
  def getCompleteCorpse (id: Long) = Action { implicit request =>
    val bucket = S3("ex-corpse")

    val result = bucket get id + ".png"

    val file = Await.result(result, 10 seconds)

    val imageData =  file match {
        case BucketFile(name, contentType, content, acl, headers) => content
    }

    val imageString = "data:image/png;base64," + new String(Base64.encodeBase64(imageData))

    Ok(views.html.viewCorpse(imageString))
  }

  //DELETE	/corpse/:id
  def deleteCorpse (id: Long) = TODO
  
}