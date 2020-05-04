const express = require('express');
const router = express.Router();
const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
    host: 'localhost:9200'
});
let workouts = [
    {
        id: 1,
        type: 'Weights',
        duration: 45,
        date: "02/09/2019"
    },
    {
        id: 2,
        type: 'run',
        duration: 43,
        date: "02/09/2019"
    }
]

router.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
})

//get all
router.get('/workouts', (req, res) => {
    return res.status(200).send({
        message: 'get workouts call succeed',
        workouts: workouts
    });
})

// get by id

router.get('/workouts/:id', (req, res) => {
   // let workout = workouts.find(workout => workout.id == req.params.id);
    let workout;

    client.get({
        index: 'workout',
        type: 'mytype',
        id: req.params.id
    }, function(err, resp, status) {
        if(err){
            console.log(err)
        } else {
            workout = resp._source;
            console.log('found the request document', resp);
            if(!workout){
                return res.status(400).send({
                    message: `workout is not found for id ${req.params.id}`
                });
            }
            return res.status(200).send({
                message: `Get workout call for id ${req.params.id} succeeded`,
                workouts: workout
            });
        }
    });
    
})

//post workout
 router.post('/workout', (req, res) => {
    if(!req.body.id){
        return res.status(400).send({
            message: `Id is required`
        })
    }
    //workouts.push(req.body);
    client.index({
        index: 'workout',
        type: 'mytype',
        id: req.body.id,
        body: req.body
    }, function(err, resp, status){
        if(err){
            console.log(err);
        } else {
            return res.status(200).send({
                message: `Post workout call succeeded`
            })
        }
    })
 });

  router.put('/workout', (req, res) => {
      if(!req.body.id){
          return res.status(400).send({
              message: `id is required`
          });
      }

      let foundIndex = workouts.findIndex(w => w.id == req.body.id);
      workouts[foundIndex] = req.body;
      return res.status(200).send({
          message: `Put workout call id ${req.body.id} succeeded`
      });
  })


  router.delete('/workout/:id', (req, res) => {
    let foundIndex = workouts.findIndex(w => w.id == req.params.id);
    workouts.splice(foundIndex, 1);

    return res.status(200).send({
        message: `delete workout call id ${req.body.id} succeeded`
    });
})



module.exports = router;