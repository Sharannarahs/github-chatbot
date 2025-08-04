// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import {getDownloadURL, getStorage, ref, uploadBytesResumable} from "firebase/storage";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyBJ6rUarXc4H4EkrO2QoS4dXoakBOi90Kg",
//   authDomain: "github-chatbot-176a1.firebaseapp.com",
//   projectId: "github-chatbot-176a1",
//   storageBucket: "github-chatbot-176a1.firebasestorage.app",
//   messagingSenderId: "384856113491",
//   appId: "1:384856113491:web:f2d15f36e9e31ff8cd61a6"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// export const storage = getStorage(app)

// // FUNCTION TO UPLOAD FILES
// export async function uploadFile(file: File, setProgress?: (progress: number) => void) {
//     return new Promise((resolve, reject) => {
//         try{
//             const storageRef = ref(storage,file.name)
//             const uploadTask = uploadBytesResumable(storageRef, file)

//             // WHENEVR STATE CHANGES,GIVE SNAPSHOT  
//             uploadTask.on('state_changed', snapshot => {
//                 const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
//                 if(setProgress) setProgress(progress)
//                 switch(snapshot.state){
//                     case 'paused':
//                         console.log('upload is paused'); break;
//                     case 'running':
//                         console.log('upload is running'); break;
                
//                 }
                
//             }, error => {
//                 reject(error)
//             }, () => {
//                getDownloadURL(uploadTask.snapshot.ref).then(downloadUrl => {
//                 resolve(downloadUrl)
//                }
//                )
//             })
//         } catch (error) {
//             console.error(error)
//             reject(error)
//         }
//     })
// }