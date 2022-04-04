const Counter = require("./../models/counter")

class CounterController {
    static result = null;
    // SHOW MEMBER BY ID IN DB
    static get_counter(info,create_counter,cb){
        const all = Counter.find({},(err, counters)=>{
            var CounterMap = [];
            var response ;    
                
            counters.forEach((counter,index)=>{
                CounterMap[index] = {
                    "user_counter" : counter.user_counter,
                    "member_counter" : counter.member_counter,
                    "complaint_counter" : counter.complaint_counter
                };
            });
            
            if (CounterMap.length == 0){
                    if(create_counter){
                    const counter = new Counter({
                        user_counter : 0,
                        member_counter : 0,
                        complaint_counter : 0
                    })
                    counter.save()
                    response = 0
                }else{
                    response = false
                }
            }else{
                
                for(var i in CounterMap[0]) {
                    if (i == info){
                        response = CounterMap[0][i]
                        break;
                    }
                }
            }
            cb(response)
              
        })
    }
    static inc_counter(old_counter,new_counter,cb){
        Counter.updateOne(old_counter,new_counter).then((result) => {
            cb()
        })
    }
}

module.exports = CounterController

