CREATE SCHEMA [CloudAutomation] AUTHORIZATION [dbo]
GO

CREATE TABLE CloudAutomation.Rating
	(
		Id int PRIMARY KEY NOT NULL IDENTITY(1,1),
		RatingScore int NOT NULL,
		RatingTitle varchar(10) NOT NULL
	)
CREATE TABLE CloudAutomation.Vote
	(
		Id int PRIMARY KEY NOT NULL IDENTITY(1,1),
		RatingId int NOT NULL,
		ClientIP varchar(128) NOT NULL,
		SubmissionDate datetime NOT NULL,
		FOREIGN KEY (RatingId) REFERENCES CloudAutomation.Rating(Id),
	)
GO

INSERT CloudAutomation.Rating (RatingScore, RatingTitle) VALUES
(1, 'Awful'),
(2, 'So So'),
(3, 'Love It')
GO