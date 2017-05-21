Select v.Id as VoteId, v.RatingId, r.RatingTitle, v.ClientIP, v.SubmissionDate from CloudAutomation.Vote v
JOIN CloudAutomation.Rating r on v.RatingId = r.Id
