 
# --- !Ups
CREATE TABLE corpse (
	id SERIAL PRIMARY KEY,
	bucketName varchar(200) NOT NULL
);



# --- !Downs

DROP TABLE IF EXISTS corpse;
