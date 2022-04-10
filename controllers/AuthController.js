const User = require("./../models/user")
const Member = require("./../models/member")
const Complaint = require("./../models/complaint")

class AuthController {
    static async get_role(id,cb){
        let src = {"_id":id}
        const src_ = await User.find(src)
        if(src_.length > 0){
            cb(src_[0].role,true)
        }else{
            cb(-1,false)
        }
    }
    static async isRole(id,role,skip,cb){
        if(skip){
            cb(true)
            return true
        }
        let src = {"_id":id}
        const src_ = await User.find(src)
        if(src_.length > 0){
            if(src_[0].role == role){
                cb(true)
                return true
            }
            cb(false,true)
        }else{
            cb(false,false)
        }
    }
    static async isAboveTheRole(id,min,skip,cb){
        if(skip){
            cb(true)
            return true
        }
        let src = {"_id":id}
        const src_ = await User.find(src)
        if(src_.length > 0){
            if(src_[0].role >= min){
                cb(true)
                return true
            }
            cb(false,true)
        }else{
            cb(false,false)
        }
    }

    static async isAboveTheUserRole(source,destination,cb){
        let src = {"_id":source}
        let dest = {"user_id":destination}
        const src_ = await User.find(src)
        const dest_ = await User.find(dest)

        if (src_.length > 0 && dest_.length > 0) {
            if((src_[0].role > dest_[0].role && src_[0].role == 3) || src_[0].role == 3){
                cb(true)
                return true
            }
            cb(false,true)
        }else{
            cb(false,false)
        }
    }
    static async isSubjectTeacher(source,subject,cb){
        let src = {"_id":source}
        const src_ = await User.find(src)
        if(src_.length == 1){
            let dest = {"member_id":src_[0].user_refere}
            const dest_ = await Member.find(dest)
            if(dest_.length == 1){
                if(dest_[0].status.get("state").toLowerCase() == "teacher" && dest_[0].status.get("subject").toLowerCase() == subject.toLowerCase()){
                    cb(true)
                    return true
                }else{  
                    cb(false,[true,true])
                }
            }else{
                cb(false,[true,false])
            }
        }else{
            cb(false,[false,false])
        }
        
    }
    static async isStudent(source,cb){
        let src = {"_id":source}
        const src_ = await User.find(src)
        if(src_.length == 1){
            let dest = {"member_id":src_[0].user_refere}
            const dest_ = await Member.find(dest)
            if(dest_.length == 1){
                if(dest_[0].status.get("state").toLowerCase() == "student" || src_[0].role >= 3){
                    cb(true)
                }else{  
                    cb(false,[true,true])
                }
            }else{
                cb(false,[true,false])
            }
        }else{
            cb(false,[false,false])
        }
        
    }
    static async isHaveAComplaint(source,complaint_id,cb){
        let src = {"_id":source}
        const src_ = await User.find(src)
        if(src_.length == 1){
            let compaint = {"student_id":src_[0].user_refere,"complaint_id" : complaint_id}
            const compaint_ = await Complaint.find(compaint)
            if(compaint_.length == 1){
                cb(true)
            }else{
                cb(false,true)
            }
        }else{
            cb(false,false)
        }
    }

}
module.exports = AuthController