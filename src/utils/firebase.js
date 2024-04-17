import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, deleteObject, getBytes } from "firebase/storage";
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  updateDoc,
  setDoc,
  deleteDoc
} from "firebase/firestore";

export class DataBase{

  constructor(){
    this.fbApp = getFirebaseInstance()
    this.fireStore = getFirestore(this.fbApp)
    this.fbStorage = getStorage(this.fbApp)

    this.LoginSession = new LoginSessions(this.fireStore)
    this.UserOps = new User(this.fireStore, this.fbStorage)
    this.MarkOps = new Mark(this.fireStore, this.fbStorage)
  }

  static async addNewMark(mark, imgBuf) {
    let isImgUploaded= false
    let isMarkUploaded = false
    let isUserUpdated = false
    let MarkOps = DataBase.Mark()
    
    let addMark
    try{
      await this.uploadImg(MarkOps.fbStorage, mark.image,  Buffer.from(imgBuf), false)
      isImgUploaded = true
      addMark = await MarkOps.addMark(mark)
      if(addMark.isSuccess){
        isMarkUploaded = true
        let userUpdate = await this.UserOps().appendAddedMarks(mark.addedBy, addMark.id)
        if(userUpdate.isSuccess) isUserUpdated = true 
      }
    }catch(e){
      console.log("Error: Image upladed- ", isImgUploaded,  "Mark uploaded- ", isMarkUploaded, "\n", e)
      if(isImgUploaded && !isMarkUploaded){
        await this.deleteImg(MarkOps.fbStorage, mark.image, false)
      }else if(isImgUploaded && isMarkUploaded && !isUserUpdated){
        await this.deleteImg(MarkOps.fbStorage, mark.image, false)
        await MarkOps.removeMark(addMark.id)
      }
      console.log("IMG: ", isImgUploaded, "DOC: ", isMarkUploaded)
      return {isSuccess: false}
    }
    
    console.log("SUCCESS: IMG: ", isImgUploaded, "DOC: ", isMarkUploaded)
    return {isSuccess: isImgUploaded && isMarkUploaded}

  }

  static getFirebaseInstance() {
    // Your web app's Firebase configuration
    const firebaseConfig = {
      apiKey: process.env.API_KEY,
      authDomain: process.env.AUTH_DOMAIN,
      projectId: process.env.PROJECT_ID,
      storageBucket: process.env.STORAGE_BUCKET,
      messagingSenderId: process.env.MESSAGING_SENDER_ID,
      appId: process.env.APP_ID,
    };

    // Initialize Firebase
    return initializeApp(firebaseConfig);
  }

  /**
   *
   * @param fbApp FirebaseApp
   * @param imgName string
   * @param img Uint8Array || Buffer
   * @param toProfiles boolean
   */
  static async uploadImg(fbStorage, imgName, img, toProfiles = false) {
    let isSuccess = false;
    let imgParent = toProfiles ? "profiles/" : "appImages/";

    var imgRef = ref(fbStorage, `${imgParent}${imgName}`);
    let x = await uploadBytes(imgRef, img);
    if (x) {
      console.log("... SUCCCESS IMG UPLOAD ...");
      isSuccess = true;
    } else {
      console.log("uploadImg(): May Be some errors occured !");
    }

    return isSuccess;
  }

  static async deleteImg(fbStorage, imgName, fromProfiles= false){
    let isSuccess = false;
    try{
      let imgParent = fromProfiles ? "profiles/" : "appImages/";

      var imgRef = ref(fbStorage, `${imgParent}${imgName}`);
      await deleteObject(imgRef)
      
        console.log("... SUCCCESS IMG DELETE ...");
        isSuccess = true;
    } catch(e) {
      console.log("deleteImg(): May Be some errors occured !", e);
    }

    return isSuccess;
  }

  static async getImage(fbStorage, imgName, fromProfiles= false){
    let isSuccess = false;
    let imgBuf = undefined
    try{
      let imgParent = fromProfiles ? "profiles/" : "appImages/";

      var imgRef = ref(fbStorage, `${imgParent}${imgName}`);
      imgBuf = await getBytes(imgRef)
      
      console.log(`... SUCCCESS IMG FETCH ...`);
      isSuccess = true;
    } catch(e) {
      // console.log("getImg(): May Be some errors occured !", e);
    }

    return {isSuccess: isSuccess, buf: imgBuf};
  }

  static LoginSession(){
    return new LoginSessions(getFirestore(this.getFirebaseInstance()))
  }

  static UserOps(){
    return new User(getFirestore(this.getFirebaseInstance()), getStorage(this.getFirebaseInstance()))
  }

  static Mark(){
    return new Mark(getFirestore(this.getFirebaseInstance()), getStorage(this.getFirebaseInstance()))
  }


}

export class RescueNotification{

  constructor(requesterId, markId, requestAt, isSeen, seenAt, type, msg, id, markAuthorId, image){
    this.rescueRequestBy = requesterId
    this.markId = markId
    this.requestAt = Timestamp.fromDate(requestAt)
    this.isSeen = isSeen
    this.isApproved = false
    this.seenAt = Timestamp.fromDate(seenAt)
    this.type = type
    this.msg = msg
    this.id = id
    this.markAuthorId = markAuthorId
    this.image = image
    this.responseReceived = false
  }

  static TYPES = {
    RescueApprovalRequest: "notification_rescue_approval_request",
    RequestResponse: "notification_request_response"
  }

  getObject() {
    
    return {
      rescueRequestBy: this.rescueRequestBy,
      markId: this.markId,
      requestAt: this.requestAt,
      isSeen: this.isSeen,
      isApproved: this.isApproved,
      seenAt: this.seenAt,
      type: this.type,
      msg: this.msg,
      id: id,
      markAuthorId: this.markAuthorId,
      image: this.image,
      responseReceived: this.responseReceived
    }

  }

}

export class LoginSessions {

  static LoginSessionObject(userId, token, expires) {
    return {
      userId: userId,
      token: token,
      expires: Timestamp.fromDate(expires)
    }
  }

  constructor(fireStore){
    this.fireStore = fireStore
  }

  async getUserIdFromtoken(token){
    let userId = undefined
    try{
      let sessionList = await this.getSessionList()
      if(sessionList.isSuccess){
        for(let i=0; i<(await sessionList).list.length; i++){
          if(sessionList.list[i].token == token){
            userId = sessionList.list[i].userId
            // console.log("Got the user id: ", userId)
            break
          }
        }
      }else throw new Error("Can't fetch session...")
    }catch(e){
      console.log("Unexpected error: ", e)
      if(userId) return {isSuccess: true, userId: userId} 
      else return {isSuccess: false, msg: "Not Found"}
    }
    if( userId )
    return {isSuccess: true, userId: userId} 
    else return {isSuccess: false, msg: "Not Found"}
  }

  async addSession( token, userId, expires){
    try{
    
    let docRef = doc(this.fireStore, `${process.env.LOGIN_SESSION_COLLECTION}/${process.env.LOGIN_SESSION_DOC}`)
    let fDoc = (await getDoc(docRef)).data()

    fDoc.session.push({...(LoginSessions.LoginSessionObject(userId, token, expires))})
    await updateDoc(docRef, fDoc)
    return {isSuccess: true}
    }catch(e){
      console.log("unexpectd err: ", e)
      return {isSuccess: false, msg: "Unexpected Error"}
    }
  }

  async getSessionList() {
    let isSuccess = false;
    let fetchedDoc = null;
    try {
      let collectRef = collection(
        this.fireStore,
        process.env.LOGIN_SESSION_COLLECTION
      );
      let docRef = doc(collectRef, process.env.LOGIN_SESSION_DOC);
      fetchedDoc = await getDoc(docRef);
      isSuccess = true;
    } catch (e) {
      console.log("Unexpected error fetching doc: ", e);
    }

    return {
      isSuccess: isSuccess,
      list: isSuccess ? fetchedDoc.data().session : null,
    };
  }

  async removeSession( sessionToken) {
    let updated = false;
    var updatedList = [];

    try {
      let sessionList = await this.getSessionList();
      if (sessionList.list){
        console.log("HI", sessionList)
        for (let i = 0; i < sessionList.list.length; i++) {
          console.log(sessionList.list[i].token , sessionToken)
          if (sessionList.list[i].token == sessionToken) {
            console.log(
              "TOK: ",
              sessionList.list[i].token,
              sessionList.list[i].token == sessionToken
            );
              updated = true;
              updatedList = [
                ...sessionList.list.slice(0, i),
                ...sessionList.list.slice(i + 1, sessionToken.length),
              ];
              break;
          }
        }

        if (updated) {
          let docRef = doc(
            this.fireStore,
            `${process.env.LOGIN_SESSION_COLLECTION}/${process.env.LOGIN_SESSION_DOC}`
          );
          await updateDoc(docRef, { session: updatedList });
          return { isSuccess: true };
        } else {
          return { isSuccess: false, msg: "Not found" };
        }
      } else throw new Error("ERROR FETCHING DOC");
    } catch (e) {
      console.log("Unexpected error fetching doc: ", e);
      return { isSuccess: false, msg: "Unable to fetch data" };
    }
  }

  /**
   *
   * @param token: string
   * @param userId: string
   */
  async verifySession( token, userId) {
    let isVerified = false;

    try {
      let sessionList = await this.getSessionList();
      if (sessionList) {
        // console.log("Session list: ", sessionList.list);
        for (let i = 0; i < sessionList.list.length; i++) {
          if (sessionList.list[i].token == token) {
            isVerified =
              sessionList.list[i].token == token &&
              sessionList.list[i].userId == userId;
            break;
          }
        }

        return { isSuccess: true, isVerified: isVerified };
      } else throw new Error("ERROR FETCHING DOC");
    } catch (e) {
      console.log("Unexpected error fetching doc: ", e);
      return { isSuccess: false, msg: "Unable to fetch data" };
    }
  }

  async isTokenValid(token){
    let isValid = false
    let targetDoc = doc(this.fireStore, `${process.env.LOGIN_SESSION_COLLECTION}/${process.env.LOGIN_SESSION_DOC}`);
    try {
      let sessionList = (await getDoc(targetDoc)).data().session;
      for(let i=0; i<sessionList.length; i++){
        if(sessionList[i].token == token){
          isValid = true
          return {isSuccess: true, isValidToken: true, id: sessionList[i].userId}
        }
      }

      return {
        isSuccess: true,
        isValidToken: false,
      }
    } catch (e) {
      console.log("Unexpected error: ", e);
      return { isSuccess: false, msg: "Unexpected error" };
    }
  }
}

export class Mark {
  
  static MarkObject(
    title,
    description,
    image,
    breed,
    age,
    isForAdoption,
    isInjured,
    isRescued,
    location,
    rescuedImg,
    addedBy,
    rescuedBy,
    saviourName,
    optedToRescue,
  ) {

    return {
        title: title,
        description: description,
        breed: breed,
        age: age,
        isForAdoption: isForAdoption,
        image: image,
        isInjured: isInjured,
        isRescued: isRescued,
        location: location,
        rescuedImg: rescuedImg,
        addedBy: addedBy,
        rescuedBy: rescuedBy,
        saviourName: saviourName,
        optedToRescue: optedToRescue
    }
    
  }

  constructor(fireStore, fbStorage){
    this.fireStore = fireStore
    this.fbStorage = fbStorage
  }

  async addMark( mark) {
    let isSuccess = false;
    try {
      
      const docRef = await addDoc(collection(this.fireStore, "mapMarkers"), {
        ...mark,
      });
      console.log("Doc written with ID: ", docRef.id);
      return {isSuccess: true, id: docRef.id};
    } catch (e) {
      console.log("Mark Document add Error ", e);
      return {isSuccess: false};
    }
  }

  async getMark(markId) {
    try{
      const fbCol = doc(this.fireStore, `mapMarkers/${markId}`);
      const mark = await getDoc(fbCol);
      if(mark.exists()){
         return {isSuccess: true, mark: Mark.MarkObject(
            mark.get("title"),
            mark.get("description"),
            mark.get("image"),
            mark.get("breed"),
            mark.get("age"),
            mark.get("isForAdoption"),
            mark.get("isInjured"),
            mark.get("isRescued"),
            mark.get("location"),
            mark.get("rescuedImg"),
            mark.get("addedBy"),
            mark.get("rescuedBy"),
            mark.get("saviourName"),
            mark.get("optedToRescue")
          )}
      }else{
        return {isSuccess: false, msg: "Mark not found"}
      }
    }catch(e){
      console.log(e)
      return {isSuccess: false, msg: "Unexpected Error"}
    }
  }

  async getAllMarks() {
    try{
      let listOfMarks = [];
      const querySnapshot = await getDocs(collection(this.fireStore, "mapMarkers"));
      querySnapshot.forEach((doc) => {
        // console.log(`getAllMarks(): ${doc.id} => ${doc.data().title}`);
        listOfMarks.push({...doc.data(), id: doc.id});
      });
      return {isSuccess: true, list: listOfMarks}
    }catch(e){
      console.log("getAllMarks(): Unexpected err: ", e)
      return {isSuccess: false, msg : "Unexpected error"}
    }
  }

  async updateMark(markId, markEntity) {

  }

  async updateImageLink( markId, newImgLink) {
    let isSuccess = false;
    try {
      ;
      const qrySnp = await updateDoc(doc(this.fireStore, `mapMarkers/${markId}`), {
        image: newImgLink,
      });
      isSuccess = true;
    } catch (e) {
      console.log("SOME ERR: ", e);
    }
    return isSuccess;
  }

  async markRescued(rescueUserId, img) {}
  async removeMark(markId) {
    await deleteDoc(doc(this.fireStore, `mapMarkers/${markId}`))
  }

  /** Use carefully, as only updates current doc property and doesn't updates connected users or actions that should be update in order to make
   * app work properly
   */
  async updateSpecific(docId, updationObject) {
    try{
      let docRef = doc(this.fireStore, `mapMarkers/${docId}`)
      await updateDoc(docRef, updationObject)
      return {isSuccess: true}
    }catch(e){
      console.log("updateSpecific(): ", e)
      return {isSuccess: false, msg: "Unexpected Error"}
    }
  }

  async markAsRescued(markId, rescuedBy, saviourName, rescuedImg){
    await this.updateSpecific(markId, {
      rescuedBy: rescuedBy,
      saviourName: saviourName,
      rescuedImg: rescuedImg,
    })
  }

}

export class User {

  static UserObject(
    age,
    firstName,
    lastName,
    phone,
    marksAdded,
    rescued,
    profile,
    password,
    karma,
    notifications
  ) {
    return {
      age: age,
      firstName: firstName,
      lastName: lastName,
      phone: phone,
      marksAdded: marksAdded,
      rescued: rescued,
      profile: profile,
      password: password,
      karma: karma,
      notifications: notifications
    }
  }

  constructor(fireStore, fbStorage){
    this.fireStore = fireStore
    this.fbStorage = fbStorage
  }

  async addUser( user) {
    let isSuccess = false;
    try {
      await setDoc(doc(this.fireStore, `users`, user.phone), {...user})
      isSuccess = true;
    } catch (e) {
      console.error("Error adding document: ", e);
      return isSuccess
    }

    return isSuccess;
  }

  async getAllUsers() {
    let listOfUsers = [];;
    const querySnapshot = await getDocs(collection(fireStore, "users"));
    querySnapshot.forEach((doc) => {
      // console.log(`getAllUsers(): ${doc.id} => ${{...doc.data()}}`);
      listOfUsers.push(doc.data());
    });

    return listOfUsers;
  }

  async getUser( userPhone ) {
    try{
      const fbCol = doc(this.fireStore, `users/${userPhone}`);
      const user = await getDoc(fbCol);
      if(user.exists()){
         return {isSuccess: true, isExisting: true, user: User.UserObject(
            user.get("age"),
            user.get("firstName"),
            user.get("lastName"),
            user.get("phone"),
            user.get("marksAdded"),
            user.get("rescued"),
            user.get("profile"),
            user.get("password"),
            user.get("karma"),
            user.get("notifications")
          )}
      }else{
        return {isSuccess: false, msg: "User not found", isExisting: false}
      }
    }catch(e){
      console.log(e)
      return {isSuccess: false, msg: "Unexpected Error"}
    }
  }

  async userAlreadyExists( userPhone) {
    ;
    let targetDoc = doc(this.fireStore, `users/${userPhone}`);
    let isExisting = false;
    try {
      let fetchedDoc = await getDoc(targetDoc);
      isExisting = fetchedDoc.exists();
      // console.log("ISEXISTING: ",userPhone, isExisting);
      return {
        isSuccess: true,
        isExisting: isExisting,
        password: isExisting ? fetchedDoc.data().password : null,
      };
    } catch (e) {
      console.log("Unexpected error: ", e);
      return { isSuccess: false, msg: "Unexpected error" };
    }
  }

  async updateUser() {}
  async appendAddedMarks(userId, markId, incrementKarma=false) {
    let ops = DataBase.UserOps()
    let userFetch = await ops.getUser(userId)
    if((userFetch).isSuccess){
      let marksAdded = (userFetch).user.marksAdded
      let updateTask = await this.updateSpecific(userId, {marksAdded: [...marksAdded, markId], karma: userFetch.user.karma+1})
      if(updateTask.isSuccess){
        return {isSuccess: true}
      }else{
        console.log("appendAddedMarks(): Unable to update")
        throw new Error("Unable to update")
      }
    }else{
      console.log("appendAddedMarks(): Unable to fetch user")
      throw new Error("Unable to fetch user")
    }
  }

  async appendRescuedMarks(markId, userId) {
    let ops = DataBase.UserOps()
    let userFetch = await ops.getUser(userId)
    if((userFetch).isSuccess){
      let rescued = (userFetch).user.rescued
      let updateTask = await this.updateSpecific(userId, {rescued: [...rescued, markId]})
      if(updateTask.isSuccess){
        return {isSuccess: true}
      }else{
        console.log("appendAddedMarks(): Unable to update")
        throw new Error("Unable to update")
      }
    }else{
      console.log("appendAddedMarks(): Unable to fetch user")
      throw new Error("Unable to fetch user")
    }
  }
  async updateUserName() {}
  async updateProfileLink() {}

  /** Use carefully, as only updates current doc property and doesn't updates connected users or actions that should be update in order to make
   * app work properly
   */
  async updateSpecific(docId, updationObject) {
    try{
      let docRef = doc(this.fireStore, `users/${docId}`)
      await updateDoc(docRef, updationObject)
      return {isSuccess: true}
    }catch(e){
      console.log("updateSpecific(): ", e)
      return {isSuccess: false, msg: "Unexpected Error"}
    }
  }

  // async updatePhone(){ // To be added later }
  async removeUser(userId){ 
    try{
      let docRef = doc(this.fireStore, `users/${userId}`)
      await deleteDoc(docRef)
      return true
    }catch(e){
      console.log("removeUser(): Error:- ", e)
      return false
    }
  }

  async updateRescueRequestStatus(authorId, notifId, isApproved, markid, msg){
    
    let MarkOps = DataBase.Mark()
    let markFetch = await MarkOps.getMark(markid)
    if(markFetch.isSuccess && !markFetch.mark.isRescued){

      let author = await this.getUser(authorId)
      if(author.isSuccess && author.isExisting == true ){
        let authorNotifs = [...author.user.notifications]
        
        let isAuthorUpdated = false
        let seenNotifAt = Timestamp.fromDate(new Date())
        
        let updatedNotif 
        let payloadForAuthor 
        for(var i=0; i<authorNotifs.length; i++){
          if(notifId == authorNotifs[i].id){
            updatedNotif = {
              ...authorNotifs[i],
              seenAt: seenNotifAt,
              isSeen: true,
              isApproved: isApproved,
              msg: msg
            }

            payloadForAuthor = {
              ...authorNotifs[i],
              seenAt: seenNotifAt,
              isSeen: true,
              isApproved: isApproved
            }
            
            authorNotifs[i] = payloadForAuthor
            isAuthorUpdated = true
            break
          }
        }
        
        if(isAuthorUpdated){
          let requestor = await this.getUser(updatedNotif.rescueRequestBy)
          if(requestor.isSuccess && requestor.isExisting == true){
            if(isApproved){

              let payloadForMark = { 
                isRescued: true, 
                saviourName: `${requestor.user.firstName} ${requestor.user.lastName}`, 
                rescueImg: updatedNotif.image, 
                rescuedBy: requestor.user.phone 
              }              

              let [markUpdate, requestorUpdate] = await Promise.all([
                DataBase.UserOps().updateSpecific(authorId, {notifications: authorNotifs}),
                MarkOps.updateSpecific(markid, payloadForMark),
                this.addNotification({...updatedNotif, msg: msg, type: RescueNotification.TYPES.RequestResponse})
              ])

              if(markUpdate.isSuccess && requestorUpdate.isSuccess){
                return {isSuccess: true}
              }else{
                return {isSuccess: false, msg: "Something went wrong while updating request status"}
              }

            }else{

              let newOptedList = [...markFetch.mark.optedToRescue]
              for(var b=0; b<newOptedList.length; b++){
                  if(newOptedList[b] == updatedNotif.rescueRequestBy){
                    newOptedList = [...newOptedList.slice(0, b), ...newOptedList.slice(b+1, newOptedList.length)]
                    break
                  }
              }

              let [markUpdate, authorUpdate, requestorUpdate] = await Promise.all([
                MarkOps.updateSpecific(markid, {optedToRescue: newOptedList}),
                DataBase.UserOps().updateSpecific(authorId, {notifications: authorNotifs}),
                this.addNotification({...updatedNotif, type: RescueNotification.TYPES.RequestResponse})
              ])

              if(markUpdate.isSuccess && requestorUpdate.isSuccess && authorUpdate.isSuccess){
                return {isSuccess: true}
              }else{
                return {isSuccess: false, msg: "Something went wrong while updating request status"}
              }

            }
          }else return {isSuccess: false, msg: "Invalid Requestor id"}
        }else{
          return {isSuccess: false, msg: "No Such Request to answer !"}
        }
        
      }else return {isSuccess: false, msg: "Unable to update details"}

    }else if(markFetch.isSuccess && markFetch.mark.isRescued){
      return {isSuccess: false, msg: `Pal (animal) has already been rescued by ${markFetch.mark.saviourName}`}
    }else return markFetch
  }

  async addNotification(notificationObj){
    switch(notificationObj.type){

      case RescueNotification.TYPES.RequestResponse:
        var fetchUserResp = await this.getUser(notificationObj.rescueRequestBy)
        if(fetchUserResp.isSuccess && fetchUserResp.isExisting == true){
          let userNotifs = [...fetchUserResp.user.notifications]
          userNotifs.push({...notificationObj})
          let updatingPayload = {notifications: userNotifs, rescued: (notificationObj.isSeen && notificationObj.isApproved ) ? [...fetchUserResp.user.rescued, notificationObj.markId] : fetchUserResp.user.rescued} 
          let task1 = await this.updateSpecific(notificationObj.rescueRequestBy, updatingPayload)
          return task1
        }else{
          return {isSuccess: false, msg: fetchUserResp.msg}
        }
        break;

      case RescueNotification.TYPES.RescueApprovalRequest:
        var fetchUserResp = await this.getUser(notificationObj.markAuthorId)
        if(fetchUserResp.isSuccess && fetchUserResp.isExisting == true){
          let userNotifs = [...fetchUserResp.user.notifications]
          userNotifs.push({...notificationObj})
          let task1 = await this.updateSpecific(notificationObj.markAuthorId, {notifications: userNotifs})
          return task1
        }else{
          return {isSuccess: false, msg: fetchUserResp.msg}
        }
        break;

    }
  }
  
}
