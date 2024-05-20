let express = require("express")

let cors = require("cors")
let app = express();
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


const jwt = require('jsonwebtoken');
require('dotenv').config()
const stripe = require('stripe')('sk_test_51NIabfCpvBGNsqQsxWU6lqpGW7YoVmaDdsq28EqNEByu3ROVDdTb9Qifm1qH5HPOF5nEDX5fbrannrp6GgkBmZHR00pljdX5dR')
app.use(cors())
app.use(express.json())
let port = process.env.PORT || 5000;
let { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.get('/hello', async (req, res) => {

  res.send("hello");
})

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ error: true, message: 'unauthorized access' });
  }
  // bearer token
  const token = authorization.split(' ')[1];

  jwt.verify(token, 'dafea91334ce03e49042a919e62de4bd212fc5d3c5c1e08656122279bb16bbadca7be7506441ff2e209f59235ab8dc4eb21ee5ae96d9816168c68e22ed9247d9', (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: true, message: 'unauthorized access' })
    }
    req.decoded = decoded;
    next();
  })
}
let uri = "mongodb+srv://raihanmiraj:Bangladesh123@cluster0.dhnvk0f.mongodb.net/?retryWrites=true&w=majority";
// let uri = 'mongodb+srv://samisiam851:IzxHVRpaCCZiyoO9@cluster0.lkouiuy.mongodb.net/?retryWrites=true&w=majority';
let users = [];
let client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
const transporter = nodemailer.createTransport({
  port: 465,
  host: "smtp.gmail.com",
  auth: {
    user: 'samisiam851@gmail.com',
    pass: 'mtsiqodfiaixvqyj',
  },
  secure: true, // upgrades later with STARTTLS -- change this based on the PORT
});
const generateRandomPin=()=> {
  let pin = '';
  for (let i = 0; i < 4; i++) {
    const randomDigit = Math.floor(Math.random() * 10);
    pin += randomDigit;
  }
  return pin;
}



async function run() {
  try {
    // await client.connect();
    // await client.db("summercampschool").command({ ping: 1 });
    let database = client.db("votepulse");
    let classes = database.collection("classes")
    let electionsDocument = database.collection("elections")
    let enrolledClasses = database.collection("enrolledclasses")
    let candidateDocuments = database.collection("candidates")
    const usersCollection = database.collection("users");
    const voteCollection = database.collection("votes"); 
    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })

      res.send({ token })
    })



    
app.post('/sendotp', async (req, res) => {
  const { to  } = req.body;
  const randomPin = generateRandomPin();
  const mailData = {
    from: 'samisiam851@gmail.com',
    to: to,
    subject: "Get Your OTP",
    text:  `Your OTP is ${randomPin}`,
    html: `<b>Hey there! </b><br> Your OTP is ${randomPin}<br/>`,
  };
 const filter = { email:to };
  const updateDoc = {
    $set: {
      otp: randomPin
    },
  };

  const result = await usersCollection.updateOne(filter, updateDoc);


  transporter.sendMail(mailData, (error, info) => {
    if (error) {
      return console.log(error);
    }
    res.status(200).send({ message: "Mail send", message_id: info.messageId });
  });
});

app.post('/verifyotp', async (req, res) => {
  const { otp, email  } = req.body; 
   const result =  await usersCollection.find({email:email, otp:otp}).toArray();
 if(result.length==0){
  res.status(404).send({ message: "not exist"   });
 }else{
  res.status(200).send({ message: "exist"  });
 }

});


    // vote start
    // election create
    app.post("/add/election", async (req, res) => {
      let data = { ...req.body };
      let result = await electionsDocument.insertOne(data)
      res.send(JSON.stringify(result))
    })
    app.get("/election/:electionid", async (req, res) => {
      let electionid = req.params.electionid
      let cursor = classes.findOne({ _id: new ObjectId(electionid) });
      let result = await cursor
      res.send(result)
    })

    app.get("/electiontitle/:electionid", async (req, res) => {
      let electionid = req.params.electionid
      let cursor = electionsDocument.findOne({ _id: new ObjectId(electionid) });
      let result = await cursor
      res.send(result)
    })

    app.put("/election/:electionid/:status", async (req, res) => {
      let electionid = req.params.electionid
      let status = req.params.status
      const data = req.body;
      const filter = { _id: new ObjectId(electionid) };
      const updateDoc = {
        $set: {
          currentStatus: status
        },
      };

      const result = await electionsDocument.updateOne(filter, updateDoc);
      res.send(result)
    })
    app.get("/admin/elections", async (req, res) => {
      let result = await electionsDocument.find({}).toArray();
      res.send(result)
    })

    app.delete('/admin/election/delete/:id', async (req, res) => {
      let deleteId = req.params.id
      let query = {
        _id: new ObjectId(deleteId),


      }
      let deleteData = await electionsDocument.deleteOne(query);
      if (deleteData.deletedCount == 1) {
        res.send("Succesfully Deleted")
      } else {
        res.send(" Deleted Failed")

      }

    });



    // for user
    app.get("/elections", async (req, res) => {
      let result = await electionsDocument.find({ currentStatus: 'running' }).toArray();
      res.send(result)
    })



    // remaining canddate search

    app.get("/users/notcandidate", async (req, res) => {
      let result = await usersCollection.find({}).toArray();
      res.send(result)
    })
    // {
    //   "_id": "64b42cb94b4cf0b8ba7bef10",
    //   "name": "Nazmul Hasan",
    //   "email": "nabil@gmail.com",
    //   "photoURL": "https://i.ibb.co/bQ5TvqM/P3-OLGJ1-copy-1.png",
    //   "role": "voter",
    //   "nid": "3754926487"
    // }


    app.delete("/delete/candidate/:candidateid/:electionid", async (req, res) => {
      let candidateid = req.params.candidateid
      let electionid = req.params.electionid
       let query = {
        // _id: new ObjectId(candidateid),
        electionid:electionid,
        userid:candidateid
   }
      let deleteData = await candidateDocuments.deleteOne(query);
      if (deleteData.deletedCount == 1) {
        res.send("Succesfully Deleted")
      } else {
        res.send(" Deleted Failed")

      }

    })



    app.post("/add/candidate/:electionid", async (req, res) => {
      const bodyData = req.body;
      let electionid = req.params.electionid
      let selectCandidated = bodyData.selectCandidated
      // let data = await selectCandidated.map(async (e) => {
      //   let dataUpdate = {
      //     electionid,
      //     userid: e._id,
      //     name: e.name,
      //     photoURL: e.photoURL,
      //     email: e.email,
      //     role: "candidate",
      //     nid: e.nid
      //   }

      //   const options = { upsert: true };
      //   const filterhere = { email: e.email, electionid: e.electionid };

      //   const updateDocCandidate = {
      //     $setOnInsert: dataUpdate,
      //   };
      //   const results = await candidateDocuments.updateOne(filterhere, updateDocCandidate, options);
      //  return results;

      // });
      try {
        for (const e of selectCandidated) {
          const dataUpdate = {
            electionid,
            userid: e._id,
            name: e.name,
            photoURL: e.photoURL,
            email: e.email,
            role: "candidate",
            nid: e.nid,
            vote: 0
          };

          const options = { upsert: true };
          const filter = { email: e.email, electionid: electionid };

          const updateDocCandidate = {
            $setOnInsert: dataUpdate,
          };

          const result = await candidateDocuments.updateOne(filter, updateDocCandidate, options);
          console.log(`Candidate inserted: ${result.upsertedCount > 0}`);
        }
      } catch (error) {
        console.error('Error:', error);
        // Handle the error accordingly
      }


      //  let result = await candidateDocuments.insertMany(data)



      const ids = selectCandidated.map(e => {
        return new ObjectId(e._id)
      })
      const filter = { _id: { $in: ids } };

      const updateDoc = {
        $set: {
          role: 'candidate'
        },
      };
      const results = await usersCollection.updateMany(filter, updateDoc);
      res.send(results);
    })




    app.get('/get/candidate/:electionid', async (req, res) => {
      let electionid = req.params.electionid;
      let data = []
      try {

        let result = await candidateDocuments.find({ electionid: electionid }).toArray();

        if (result.length != 0) {
          let queryArray = result.map(e => {
            return {
              _id: new ObjectId(e.userid)
            };
          });

          const query = { $or: queryArray };
          let userData = await usersCollection.find(query).toArray();
          data = userData
        }

      } catch (error) {
        res.status(500).send({
          err: "Error occurred while processing the request."
        });
      }
      res.send(data)
    });




    app.get("/candidates/:electionid", async (req, res) => {
      let electionid = req.params.electionid
      let result = await candidateDocuments.find({ electionid: electionid }).toArray();
      res.send(result)
    })


    // submit vote

    app.post("/vote/submit/", async (req, res) => {
      let bodyData = req.body;

      let candidateId = bodyData.candidateId
      let useremail = bodyData.useremail
      let electionId = bodyData.electionId


      let voteCheck = await voteCollection.find({ electionId: electionId, useremail: useremail }).toArray();
      if (voteCheck.length >0) {
       return res.status(403).send({ message: 'Already Voted' });
      }
       

      let filter = {
        _id: new ObjectId(candidateId)
      }
      let options = { upsert: true };
      let updateDoc = {
        $set: {
          useremail,
          electionId,
          candidateId
        },
      };
      let result = await voteCollection.updateOne(filter, updateDoc, options);

      let candidateDocumentsFIndbyid = await candidateDocuments.findOne({ _id: new ObjectId(candidateId) });
      let vote = candidateDocumentsFIndbyid.vote
      vote = vote + 1;
      const filter2 = { _id: new ObjectId(candidateId) };
      const updateDoc2 = {
        $set: {
          vote
        },
      };

      const result2 = await candidateDocuments.updateOne(filter2, updateDoc2);
      res.send(result2)
    })




    app.get("/vote/check/:electionid/:email", async (req, res) => {
      let electionid = req.params.electionid
      let email = req.params.email
      let result = await voteCollection.find({ electionId: electionid, useremail: email }).toArray();
      if (result.length == 0) {
        return res.status(403).send({ error: true, message: 'no vote' });
      }
      res.send(result)

    })

    app.get("/vote/check/user/:electionid/:email", async (req, res) => {
      let electionid = req.params.electionid
      let email = req.params.email
      let result = await voteCollection.find({ electionId: electionid, useremail: email }).toArray();
      if (result.length == 0) {
        return res.send({
          vote:false
        })
      }
        res.status(403).send({ vote: true, message: 'no vote' });
      

    })



    // vote end














    app.get('/email', verifyJWT, async (req, res) => {
      console.log(req.decoded)
      res.send(req.decoded.email);
    })
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email }
      const user = await usersCollection.findOne(query);
      if (user?.role !== 'admin') {
        return res.status(403).send({ error: true, message: 'forbidden message' });
      }
      next();
    }

    app.post('/users', async (req, res) => {
      const user = req.body;


      const queryone = { nid: user.nid }
      const existingNid = await usersCollection.findOne(queryone);

      if (existingNid) {
        return res.status(403).send({
          message: 'NID Already exists'
        });
      }


      const query = { email: user.email }
      const existingUser = await usersCollection.findOne(query);

      if (existingUser) {
        return res.send({ message: 'user already exists', data: existingUser })
      }

      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
    // app.get('/users', verifyJWT, verifyAdmin, async (req, res) => {
    //   const result = await usersCollection.find().toArray();
    //   res.send(result);
    // });

    // payment 

    // create payment intent


    app.get("/class/:classid", async (req, res) => {
      let toyid = req.params.classid
      let cursor = classes.findOne({ _id: new ObjectId(toyid) });
      let result = await cursor
      res.send(result)
    })


    app.post('/create-payment-intent', async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        payment_method_types: ['card']
      });

      res.send({
        clientSecret: paymentIntent.client_secret
      })
    })


    // payment related api
    app.post('/payments/:id', async (req, res) => {
      let id = req.params.id
      const data = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          transactionId: data.transactionId,
          price: data.price,
          date: data.date,
          enrolled: true
        },
      };

      const result = await enrolledClasses.updateOne(filter, updateDoc);

      let enrolledClassesFIndbyid = await enrolledClasses.findOne({ _id: new ObjectId(req.params.id) });
      let classid = enrolledClassesFIndbyid.classid

      let findClassdetails = await classes.findOne({ _id: new ObjectId(classid) });
      let availableseat = findClassdetails.availableseat - 1;
      let enrolledstudents = findClassdetails.enrolledstudents + 1;
      let _id = findClassdetails._id;
      const filter2 = { _id: new ObjectId(_id) };
      const updateDoc2 = {
        $set: {
          availableseat: availableseat,
          enrolledstudents: enrolledstudents,
        },
      };

      const result2 = await classes.updateOne(filter2, updateDoc2);


      res.send(result2);
    })
    //     app.get('/paymentstest/:id', async (req, res) => {
    //       let enrolledClassesFIndbyid  =await enrolledClasses.findOne({ _id: new ObjectId(req.params.id) });
    //  let classid = enrolledClassesFIndbyid.classid

    //       let findClassdetails  =await classes.findOne({ _id: new ObjectId(classid) });
    //       res.send(findClassdetails)
    //     })


    app.get('/enrolledclasses/:email', async (req, res) => {
      let email = req.params.email
      const pipeline = [
        {
          $match: {
            email: email,
            enrolled: true
          }
        },
        {
          $lookup: {
            from: 'classes',
            localField: 'classid',
            foreignField: '_id',
            as: 'result'
          }
        }
      ];

      const result = await enrolledClasses.aggregate(pipeline).toArray();
      res.send(result);

    })

    app.get('/addnow', async (req, res) => {
      const pipeline = [

        {
          $match: {
            email: "rsnmiraj@gmail.com"
          },
          '$lookup': {
            'from': 'classes',
            'localField': 'classid',
            'foreignField': '_id',
            'as': 'result'
          }
        }
      ]

      const result = await enrolledClasses.aggregate(pipeline).toArray()
      res.send(result)

    })



    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });
    app.get('/selectedclass/:email', async (req, res) => {

      let email = req.params.email
      const pipeline = [
        {
          $match: {
            email: email,
            enrolled: false
          }
        },
        {
          $lookup: {
            from: 'classes',
            localField: 'classid',
            foreignField: '_id',
            as: 'result'
          }
        }
      ];

      const result = await enrolledClasses.aggregate(pipeline).toArray();
      res.send(result);

    });

    app.delete('/selectedclass/delete/:id', async (req, res) => {
      let deleteId = req.params.id
      let email = req.params.email
      let query = {
        _id: new ObjectId(deleteId),


      }
      let deleteData = await enrolledClasses.deleteOne(query);
      if (deleteData.deletedCount == 1) {
        res.send("Succesfully Deleted")
      } else {
        res.send(" Deleted Failed")

      }

    });

    app.post("/select/class/", async (req, res) => {
      let data = { ...req.body };
      const query = { classid: new ObjectId(data.classid), email: data.email }
      const existingData = await enrolledClasses.findOne(query);

      if (existingData) {
        return res.send({ message: 'exist' })
      }
      data['classid'] = new ObjectId(data.classid)
      let result = await enrolledClasses.insertOne(data)
      res.send(JSON.stringify(result))
    })

    app.patch('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'admin'
        },
      };

      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);

    })

    app.patch('/users/voter/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'voter'
        },
      };

      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);

    })

    app.post("/addclass", async (req, res) => {
      let data = { ...req.body };
      let result = await classes.insertOne(data)
      res.send(JSON.stringify(result))
    })

    app.get("/classes/find/:email", async (req, res) => {
      let cursor = classes.find({ instructoremail: req.params.email });
      let result = await cursor.toArray();
      res.send(result);

    });

    app.get("/classes/all", async (req, res) => {
      let cursor = classes.find({ status: 'approved' });
      let result = await cursor.toArray();
      res.send(result);

    });
    app.get("/admin/classes/all", async (req, res) => {
      let cursor = classes.find();
      let result = await cursor.toArray();
      res.send(result);

    });
    app.get("/instructor/all", async (req, res) => {
      let cursor = usersCollection.find({ role: "instructor" });
      let result = await cursor.limit(6).toArray()
      res.send(result);

    });
    app.get("/popularclasses", async (req, res) => {
      let cursor = classes.find().sort({ enrolledstudents: -1 });
      let result = await cursor.limit(6).toArray();
      res.send(result);

    });

    app.get("/paymenthistory/:email", async (req, res) => {

      let email = req.params.email
      const pipeline = [
        {
          $match: {
            email: req.params.email,
            enrolled: true
          }
        },
        {
          $lookup: {
            from: 'classes',
            localField: 'classid',
            foreignField: '_id',
            as: 'result'
          }
        },
        {
          $sort: {
            // Specify the field to sort by (assuming 'createdAt' field for example)
            'result._id': -1
          }
        }
      ];

      const result = await enrolledClasses.aggregate(pipeline).toArray();
      res.send(result);

    });


    app.get("/popularinstructor", async (req, res) => {
      let cursor = usersCollection.find({ role: 'instructor' });
      let result = await cursor.limit(6).toArray();
      res.send(result);

    });

    app.get("/class/:classid", async (req, res) => {
      let toyid = req.params.classid
      let cursor = classes.findOne({ _id: new ObjectId(toyid) });
      let result = await cursor
      res.send(result)
    })


    app.put("/class/update/:id", async (req, res) => {
      let updateId = req.params.id
      let filter = {
        _id: new ObjectId(updateId)
      }
      let options = { upsert: true };
      let updateDoc = {
        $set: {
          ...req.body
        },
      };
      let result = await classes.updateOne(filter, updateDoc, options);
      res.send(JSON.stringify(result))
    })

    app.put("/class/approved/:id", async (req, res) => {
      let updateId = req.params.id
      let filter = {
        _id: new ObjectId(updateId)
      }
      let options = { upsert: true };
      let updateDoc = {
        $set: {
          status: 'approved'
        },
      };
      let result = await classes.updateOne(filter, updateDoc, options);
      res.send(JSON.stringify(result))
    })

    app.put("/class/denied/:id", async (req, res) => {
      let updateId = req.params.id
      let filter = {
        _id: new ObjectId(updateId)
      }
      let options = { upsert: true };
      let updateDoc = {
        $set: {
          status: 'denied'
        },
      };
      let result = await classes.updateOne(filter, updateDoc, options);
      res.send(JSON.stringify(result))
    })
    app.put("/class/pending/:id", async (req, res) => {
      let updateId = req.params.id
      let filter = {
        _id: new ObjectId(updateId)
      }
      let options = { upsert: true };
      let updateDoc = {
        $set: {
          status: 'pending'
        },
      };
      let result = await classes.updateOne(filter, updateDoc, options);
      res.send(JSON.stringify(result))
    })

    app.put("/class/feedback/:id", async (req, res) => {
      let feedback = req.body.feedback;
      let updateId = req.params.id
      let filter = {
        _id: new ObjectId(updateId)
      }
      let options = { upsert: true };
      let updateDoc = {
        $set: {
          feedback: feedback
        },
      };
      let result = await classes.updateOne(filter, updateDoc, options);
      res.send(JSON.stringify(result))
    })





  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);









app.get("/", (req, res) => {
  res.send("user server running")
})


app.listen(port, () => {
  console.log(`server is running on port ${port}`)
})