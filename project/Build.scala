import sbt._
import Keys._
import play.Project._

object ApplicationBuild extends Build {

  val appName         = "ex-corpse"
  val appVersion      = "1.0-SNAPSHOT"
                                           
  val appDependencies = Seq(
    // Add your project dependencies here,
    "postgresql" % "postgresql" % "9.1-901-1.jdbc4",
    "com.cloudphysics" % "jerkson_2.10" % "0.6.3",
    "nl.rhinofly" %% "api-s3" % "3.1.0",
    "commons-io" % "commons-io" % "2.3",
    jdbc,
    anorm
  )


  val main = play.Project(appName, appVersion, appDependencies).settings(
    // Add your own project settings here
     resolvers += "Rhinofly Internal Repository" at "http://maven-repository.rhinofly.net:8081/artifactory/libs-release-local"  
  )

}
