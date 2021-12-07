var express = require('express');
var hotel = express();
var dotenv = require('dotenv'); 
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
dotenv.config();
var MongoUrl = 'mongodb+srv://test:testuser@cluster0.gcwdn.mongodb.net/Hotels?retryWrites=true&w=majority';
var cors = require('cors')
const bodyParser = require('body-parser')
var  port = process.env.PORT || 1322;
var db;

hotel.use(bodyParser.urlencoded({extended:true}));
hotel.use(bodyParser.json());
hotel.use(cors());


hotel.get('/',(req,res)=>{
    res.send("This is root page")
})

// return all Hotels wrt City (Query Params)
hotel.get('/hotels',(req,res) => {
    var query = {};
    console.log(req.query.city)
    if(req.query.city){
        query={state_id:Number(req.query.city)}
    }

// return all Hotels wrt location (Query Params)
    else if(req.query.location){
        var location = Number(req.query.location)
        query={"location_id":Number(req.query.location)}
    }

// return all Hotels wrt bedtypes (Query Params)
    else if(req.query.bed){
        var bed = Number(req.query.bed)
        query={"RoomTypes.bedtype_id":Number(req.query.bed)}
    }

// return all Hotels wrt roomTypes (Query Params)
    else if(req.query.type){
        var type = Number(req.query.type)
        query={"RoomTypes.roomtype_id":Number(req.query.type)}
    }
// return all Hotels wrt Room Rates (Query Params)
    else if(req.query.lcost && req.query.hcost){
        var lcost = Number(req.query.lcost);
        var hcost = Number(req.query.hcost);
        query = {$and:[{room_rate:{$gt:lcost,$lt:hcost}}]}
    }

// return all Hotels wrt Room Rates and Room Types (Query Params)
    else if(req.query.type && req.query.lcost && req.query.hcost){
        var lcost = Number(req.query.lcost);
        var hcost = Number(req.query.hcost);
        query = {$and:[{room_rate:{$gt:lcost,$lt:hcost}}]},
        {"RoomTypes.roomtype_id":Number(req.query.type)}
    }

// return Details of Hotels on bases of ID (Query Params)
    else if(req.query.details){
        var details = Number(req.query.details);
        query = {"hotel_id":Number(req.query.details)}
    }


db.collection('hoteldata').find(query).toArray((err,result) => {
	if(err) throw err;
	res.send(result)
    })
})

// return all the bookings
hotel.get('/bookings',(req,res) => {
    db.collection('reservations').find().toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})

// post bookings to reservation database 
hotel.post('/bookNow',(req,res)=>{
	console.log(req.body);
	db.collection('reservations').insert(req.body,(err,result)=>{
		if(err) throw err;
		res.send("Reservation Placed")
	})
})

// Delete orders from reservations database
hotel.delete('/delBooking',(req,res)=>{
    db.collection('reservations').remove({},(err,result) => {
        if(err) throw err;
        res.send(result)
    })
})

// update bookings in reservations database
hotel.put('/updateStatus/:id',(req,res) => {
    var id = Number(req.params.id);
    var status = req.body.status?req.body.status:"Confirmed"
    db.collection('reservations').updateOne(
        {id:id},
        {
            $set:{
                "date":req.body.date,
                "bank_status":req.body.bank_status,
                "bank":req.body.bank,
                "status":status
            }
        }
    )
    res.send('data updated')
})




MongoClient.connect(MongoUrl, (err,client) => {
    if(err) console.log("error while connecting");
    db = client.db('Hotels');
    hotel.listen(port,()=>{
        console.log(`listening on port ${port}`)
    })

})