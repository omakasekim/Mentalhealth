// // App.tsx
// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TextInput,
//   Dimensions,
//   ScrollView,
//   TouchableOpacity,
//   Button,
//   Alert,
//   Switch,
//   Platform
// } from 'react-native';
// import { createStackNavigator } from '@react-navigation/stack';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// // Chat UI
// import { GiftedChat, IMessage } from 'react-native-gifted-chat';

// // Charts (Bar Chart)
// import { BarChart } from 'react-native-chart-kit';

// // Firebase modules
// import firebase from '@react-native-firebase/app';
// import auth from '@react-native-firebase/auth';
// import firestore, { FieldValue } from '@react-native-firebase/firestore';

// // Networking
// import axios from 'axios';

// // OPTIONAL: Voice chat code (commented out)
// // import AudioRecorderPlayer from 'react-native-audio-recorder-player';
// // const audioRecorderPlayer = new AudioRecorderPlayer();

// /**********************
//  * 1) Firebase Config
//  **********************/
// const firebaseConfig = {
//   apiKey: "YOUR_FIREBASE_API_KEY",
//   authDomain: "YOUR_PROJECT.firebaseapp.com",
//   databaseURL: "https://YOUR_PROJECT.firebaseio.com",
//   projectId: "YOUR_PROJECT_ID",
//   storageBucket: "YOUR_PROJECT.appspot.com",
//   messagingSenderId: "YOUR_SENDER_ID",
//   appId: "YOUR_APP_ID"
// };

// if (!firebase.apps.length) {
//   firebase.initializeApp(firebaseConfig);
// }

// /**************************************
//  * 2) GPT-4 Distress Detection Endpoint
//  **************************************/
// const AI_ENDPOINT = "http://YOUR_SERVER_IP:8000/analyze-conversation/";

// /**********************
//  * 3) Constants
//  **********************/
// const screenWidth = Dimensions.get("window").width;
// const BChart = BarChart as any;

// /**********************
//  * 4) Data Models
//  **********************/
// export interface UserProfile {
//   email: string;
//   points: number;
//   badges: string[];
//   streak: number;
//   conversations: number;
//   volunteerHours: number;
//   privacy: {
//     showOnline: boolean;
//     allowMatching: boolean;
//   };
//   preferences: {
//     notifications: {
//       messages: boolean;
//       events: boolean;
//       dailyMotivation: boolean;
//     };
//     language: string;
//     contentFilter: boolean;
//   };
//   interests: string[];
// }

// export interface Post {
//   id: string;
//   title: string;
//   content: string;
//   authorId: string;
//   authorEmail: string;
//   communityId: string;
//   createdAt: Date;
//   upvotes: number;
//   downvotes: number;
// }

// export interface Comment {
//   id: string;
//   text: string;
//   authorId: string;
//   authorEmail: string;
//   createdAt: Date;
// }

// /**********************
//  * 5) AUTH SCREEN
//  **********************/
// const AuthScreen: React.FC<any> = ({ navigation }) => {
//   const [isLogin, setIsLogin] = useState(true);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   useEffect(() => {
//     const unsub = auth().onAuthStateChanged(user => {
//       if (user) navigation.replace("Main");
//     });
//     return () => unsub();
//   }, []);

//   const handleAuth = async () => {
//     try {
//       if (isLogin) {
//         await auth().signInWithEmailAndPassword(email, password);
//       } else {
//         const userCred = await auth().createUserWithEmailAndPassword(email, password);
//         await firestore().collection("users").doc(userCred.user.uid).set({
//           email,
//           points: 0,
//           badges: [],
//           streak: 0,
//           conversations: 0,
//           volunteerHours: 0,
//           privacy: { showOnline: true, allowMatching: true },
//           preferences: {
//             notifications: { messages: true, events: true, dailyMotivation: true },
//             language: "en",
//             contentFilter: true
//           },
//           interests: ["anxiety", "school"]
//         });
//       }
//     } catch (err: any) {
//       Alert.alert("Error", err.message);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>{isLogin ? "Login" : "Sign Up"}</Text>
//       <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" value={email} onChangeText={setEmail} />
//       <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
//       <Button title={isLogin ? "Login" : "Create Account"} onPress={handleAuth} />
//       <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
//         <Text style={{ marginTop: 10, color: 'blue' }}>
//           {isLogin ? "No account? Sign Up" : "Have an account? Login"}
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// /**********************
//  * 6) HOME SCREEN – Reddit-like Feed
//  **********************/
// const HomeScreen: React.FC<any> = ({ navigation }) => {
//   const [posts, setPosts] = useState<Post[]>([]);

//   useEffect(() => {
//     const unsub = firestore().collection("AllPosts")
//       .orderBy("createdAt", "desc")
//       .onSnapshot(snapshot => {
//         const loaded: Post[] = [];
//         snapshot.forEach(doc => {
//           const data = doc.data();
//           if (data) {
//             loaded.push({
//               id: doc.id,
//               title: data.title,
//               content: data.content,
//               authorId: data.authorId,
//               authorEmail: data.authorEmail,
//               communityId: data.communityId || "",
//               createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
//               upvotes: data.upvotes,
//               downvotes: data.downvotes,
//             });
//           }
//         });
//         setPosts(loaded);
//       });
//     return () => unsub();
//   }, []);

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.title}>Home Feed</Text>
//       {/* Category Filters */}
//       <View style={styles.card}>
//         <Text style={{ fontWeight: 'bold' }}>Categories</Text>
//         <Text>- Anxiety</Text>
//         <Text>- Depression</Text>
//         <Text>- Relationships</Text>
//         <Text>- Stress</Text>
//         <Text>- General Support</Text>
//       </View>
//       {/* Multimedia Section */}
//       <View style={styles.card}>
//         <Text style={{ fontWeight: 'bold' }}>Daily Motivation</Text>
//         <Text>Video carousel and audio player placeholder</Text>
//       </View>
//       {/* Recovery Journeys */}
//       <View style={styles.card}>
//         <Text style={{ fontWeight: 'bold' }}>Recovery Journeys</Text>
//         <Text>Guided self-help modules placeholder</Text>
//       </View>
//       <Button title="Create New Post" onPress={() => navigation.navigate("CreatePost")} />
//       {posts.map((post) => (
//         <TouchableOpacity
//           key={post.id}
//           style={styles.card}
//           onPress={() => navigation.navigate("PostDetail", { postId: post.id })}
//         >
//           <Text style={{ fontWeight: 'bold' }}>{post.title}</Text>
//           <Text numberOfLines={2}>{post.content}</Text>
//           <Text style={{ marginTop: 5, fontSize: 12, color: '#666' }}>
//             Up: {post.upvotes} | Down: {post.downvotes} | by {post.authorEmail}
//           </Text>
//         </TouchableOpacity>
//       ))}
//     </ScrollView>
//   );
// };

// const CreatePostScreen: React.FC<any> = ({ navigation }) => {
//   const user = auth().currentUser;
//   const [title, setTitle] = useState("");
//   const [content, setContent] = useState("");

//   const submitPost = async () => {
//     if (!user) return;
//     try {
//       const aiRes = await axios.post(AI_ENDPOINT, {
//         user_id: user.uid,
//         conversation: content,
//         country: "US"
//       });
//       const aiData = aiRes.data as { status: string; escalation?: { soothing_message: string } };
//       if (aiData.status === 'escalation_triggered') {
//         Alert.alert("Distress Alert", aiData.escalation?.soothing_message);
//       }
//     } catch (err) {
//       console.log("AI check error (post):", err);
//     }
//     await firestore().collection("AllPosts").add({
//       title,
//       content,
//       authorId: user.uid,
//       authorEmail: user.email,
//       communityId: "",
//       createdAt: new Date(),
//       upvotes: 0,
//       downvotes: 0
//     });
//     await firestore().collection("users").doc(user.uid).update({
//       points: (FieldValue as any).increment(5)
//     });
//     Alert.alert("Post Created", "Your post has been created!");
//     navigation.goBack();
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Create a New Post</Text>
//       <TextInput style={styles.input} placeholder="Post Title" value={title} onChangeText={setTitle} />
//       <TextInput
//         style={[styles.input, { height: 100 }]}
//         placeholder="What do you want to share?"
//         value={content}
//         onChangeText={setContent}
//         multiline
//       />
//       <Button title="Submit" onPress={submitPost} />
//     </View>
//   );
// };

// const PostDetailScreen: React.FC<any> = ({ route, navigation }) => {
//   const { postId } = route.params;
//   const user = auth().currentUser;
//   const [post, setPost] = useState<Post | null>(null);
//   const [comments, setComments] = useState<Comment[]>([]);
//   const [newComment, setNewComment] = useState("");

//   useEffect(() => {
//     const postRef = firestore().collection("AllPosts").doc(postId);
//     const unsubPost = postRef.onSnapshot(doc => {
//       const data = doc.data();
//       if (data) {
//         setPost({
//           id: doc.id,
//           title: data.title,
//           content: data.content,
//           authorId: data.authorId,
//           authorEmail: data.authorEmail,
//           communityId: data.communityId || "",
//           createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
//           upvotes: data.upvotes,
//           downvotes: data.downvotes,
//         });
//       }
//     });
//     const unsubComments = postRef.collection("comments")
//       .orderBy("createdAt", "asc")
//       .onSnapshot(snap => {
//         const loaded: Comment[] = [];
//         snap.forEach(d => {
//           const cdata = d.data();
//           if (cdata) {
//             loaded.push({
//               id: d.id,
//               text: cdata.text,
//               authorId: cdata.authorId,
//               authorEmail: cdata.authorEmail,
//               createdAt: cdata.createdAt ? cdata.createdAt.toDate() : new Date()
//             });
//           }
//         });
//         setComments(loaded);
//       });
//     return () => {
//       unsubPost();
//       unsubComments();
//     };
//   }, [postId]);

//   const onUpvote = async () => {
//     if (!user || !post) return;
//     await firestore().collection("AllPosts").doc(postId).update({
//       upvotes: (FieldValue as any).increment(1)
//     });
//     await firestore().collection("users").doc(user.uid).update({
//       points: (FieldValue as any).increment(1)
//     });
//     if (post.authorId) {
//       await firestore().collection("users").doc(post.authorId).update({
//         points: (FieldValue as any).increment(1)
//       });
//     }
//   };

//   const onDownvote = async () => {
//     if (!user || !post) return;
//     await firestore().collection("AllPosts").doc(postId).update({
//       downvotes: (FieldValue as any).increment(1)
//     });
//   };

//   const onAddComment = async () => {
//     if (!user || !post) return;
//     try {
//       const aiRes = await axios.post(AI_ENDPOINT, {
//         user_id: user.uid,
//         conversation: newComment,
//         country: "US"
//       });
//       const aiData = aiRes.data as { status: string; escalation?: { soothing_message: string } };
//       if (aiData.status === 'escalation_triggered') {
//         Alert.alert("Distress Alert", aiData.escalation?.soothing_message);
//       }
//     } catch (err) {
//       console.log("AI check error (comment):", err);
//     }
//     await firestore().collection("AllPosts").doc(postId).collection("comments")
//       .add({
//         text: newComment,
//         authorId: user.uid,
//         authorEmail: user.email,
//         createdAt: new Date()
//       });
//     await firestore().collection("users").doc(user.uid).update({
//       points: (FieldValue as any).increment(2)
//     });
//     setNewComment("");
//   };

//   if (!post) {
//     return (
//       <View style={styles.container}>
//         <Text>Loading post...</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={{ fontWeight: 'bold', fontSize: 20 }}>{post.title}</Text>
//       <Text style={{ marginVertical: 10 }}>{post.content}</Text>
//       <Text>Upvotes: {post.upvotes} | Downvotes: {post.downvotes}</Text>
//       <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 }}>
//         <Button title="Upvote" onPress={onUpvote} />
//         <Button title="Downvote" onPress={onDownvote} />
//       </View>
//       <View style={styles.card}>
//         <Text style={{ fontWeight: 'bold' }}>Add a Comment</Text>
//         <TextInput style={styles.input} placeholder="Your thoughts..." value={newComment} onChangeText={setNewComment} />
//         <Button title="Comment" onPress={onAddComment} />
//       </View>
//       <Text style={[styles.title, { marginTop: 20 }]}>Comments</Text>
//       {comments.map(c => (
//         <View key={c.id} style={styles.card}>
//           <Text>{c.text}</Text>
//           <Text style={{ fontSize: 12, marginTop: 5 }}>by {c.authorEmail}</Text>
//         </View>
//       ))}
//     </ScrollView>
//   );
// };

// /**********************
//  * 7) PEER MATCH & CHAT
//  **********************/
// const PeerMatchScreen: React.FC<any> = ({ navigation }) => {
//   const user = auth().currentUser;
//   const [matchResult, setMatchResult] = useState<string>("");

//   const findPeerMatch = async () => {
//     if (!user) return;
//     const myDoc = await firestore().collection("users").doc(user.uid).get();
//     if (!myDoc.exists) return;
//     const me = myDoc.data() as UserProfile;
//     const myInterests = me.interests || [];
//     const allUsers = await firestore().collection("users").get();
//     for (const doc of allUsers.docs) {
//       if (doc.id === user.uid) continue;
//       const other = doc.data() as UserProfile;
//       const overlap = myInterests.filter(i => other.interests.includes(i));
//       if (overlap.length > 0) {
//         setMatchResult(`Matched with ${other.email} (shared interest: ${overlap.join(", ")})`);
//         return;
//       }
//     }
//     setMatchResult("No match found with shared interests");
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Peer Match</Text>
//       <Button title="Find a Match" onPress={findPeerMatch} />
//       {matchResult ? <Text style={{ marginTop: 20 }}>{matchResult}</Text> : null}
//       <View style={{ marginTop: 30 }}>
//         <Text>Or join a group chat:</Text>
//         <Button title="Casual Thread" onPress={() => navigation.navigate("GroupChat", { room: "casual" })} />
//         <Button title="Serious Thread" onPress={() => navigation.navigate("GroupChat", { room: "serious" })} />
//       </View>
//     </View>
//   );
// };

// const GroupChatScreen: React.FC<any> = ({ route }) => {
//   const { room } = route.params; // "casual" or "serious"
//   const user = auth().currentUser;
//   const [messages, setMessages] = useState<IMessage[]>([]);

//   useEffect(() => {
//     const unsub = firestore()
//       .collection("THREADS")
//       .doc(room)
//       .collection("messages")
//       .orderBy("createdAt", "desc")
//       .onSnapshot(snap => {
//         const loaded: IMessage[] = snap.docs.map(doc => {
//           const d = doc.data();
//           return {
//             _id: doc.id,
//             text: d.text,
//             createdAt: d.createdAt ? d.createdAt.toDate() : new Date(),
//             user: d.user
//           };
//         });
//         setMessages(loaded);
//       });
//     return () => unsub();
//   }, [room]);

//   const onSend = useCallback(async (newMsgs: IMessage[] = []) => {
//     if (!user) return;
//     const text = newMsgs[0].text;
//     try {
//       const aiRes = await axios.post(AI_ENDPOINT, {
//         user_id: user.uid,
//         conversation: text,
//         country: "US"
//       });
//       const aiData = aiRes.data as { status: string; escalation?: { soothing_message: string } };
//       if (aiData.status === 'escalation_triggered') {
//         Alert.alert("Distress Alert", aiData.escalation?.soothing_message);
//       }
//     } catch (err) {
//       console.log("AI Distress error:", err);
//     }
//     await firestore()
//       .collection("THREADS")
//       .doc(room)
//       .collection("messages")
//       .add({
//         text,
//         createdAt: new Date(),
//         user: { _id: user.uid, name: user.email }
//       });
//     await firestore().collection("users").doc(user.uid).update({
//       points: (FieldValue as any).increment(1)
//     });
//     setMessages(prev => GiftedChat.append(prev, newMsgs));
//   }, []);

//   return (
//     <GiftedChat
//       messages={messages}
//       onSend={msgs => onSend(msgs)}
//       user={{ _id: user?.uid ?? "unknown", name: user?.email ?? "Anonymous" }}
//     />
//   );
// };

// /**********************
//  * 8) POINTS & REWARDS
//  **********************/
// const PointsScreen: React.FC = () => {
//   const user = auth().currentUser;
//   const [points, setPoints] = useState(0);
//   const [leaderboard, setLeaderboard] = useState<any[]>([]);

//   useEffect(() => {
//     if (!user) return;
//     const unsub = firestore().collection("users").doc(user.uid)
//       .onSnapshot(doc => {
//         const data = doc.data();
//         if (data) setPoints(data.points);
//       });
//     return () => unsub();
//   }, [user]);

//   useEffect(() => {
//     const unsub = firestore().collection("users")
//       .orderBy("points", "desc")
//       .limit(5)
//       .onSnapshot(snap => {
//         const lb: any[] = [];
//         snap.forEach(d => {
//           const dData = d.data();
//           if (dData) lb.push({ email: dData.email, points: dData.points });
//         });
//         setLeaderboard(lb);
//       });
//     return () => unsub();
//   }, []);

//   const redeemPoints = async () => {
//     if (!user) return;
//     if (points < 100) {
//       Alert.alert("Not enough points", "Need at least 100 points to redeem 1 volunteer hour.");
//       return;
//     }
//     const hours = Math.floor(points / 100);
//     const remainder = points % 100;
//     await firestore().collection("users").doc(user.uid).update({
//       points: remainder,
//       volunteerHours: (FieldValue as any).increment(hours)
//     });
//     Alert.alert("Redemption", `Redeemed ${hours} volunteer hours!`);
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.title}>Points & Rewards</Text>
//       <Text>Your Points: {points}</Text>
//       <Button title="Redeem for Volunteer Hours" onPress={redeemPoints} />
//       <Text style={[styles.title, { marginTop: 20 }]}>Leaderboard (Top 5)</Text>
//       {leaderboard.map((lb, i) => (
//         <View key={i} style={styles.card}>
//           <Text>{lb.email}</Text>
//           <Text>{lb.points} pts</Text>
//         </View>
//       ))}
//     </ScrollView>
//   );
// };

// /**********************
//  * 9) IMPACT TRACKER – Monthly Aggregation
//  **********************/
// const ImpactTrackerScreen: React.FC = () => {
//   const user = auth().currentUser;
//   const [dailyPoints, setDailyPoints] = useState<number[]>([]);
//   const [labels, setLabels] = useState<string[]>([]);

//   useEffect(() => {
//     if (!user) return;
//     const now = new Date();
//     const year = now.getFullYear();
//     const month = now.getMonth();
//     const start = new Date(year, month, 1);
//     const end = new Date(year, month + 1, 1);
    
//     const unsubscribe = firestore()
//       .collection("users")
//       .doc(user.uid)
//       .collection("stats")
//       .where("date", ">=", start)
//       .where("date", "<", end)
//       .orderBy("date", "asc")
//       .onSnapshot(snapshot => {
//         const tempPoints: number[] = [];
//         const tempLabels: string[] = [];
//         snapshot.forEach(doc => {
//           const data = doc.data();
//           if (data && data.date) {
//             const date = data.date.toDate();
//             tempLabels.push(date.getDate().toString());
//             tempPoints.push(data.points);
//           }
//         });
//         setLabels(tempLabels);
//         setDailyPoints(tempPoints);
//       });
//     return () => unsubscribe();
//   }, [user]);

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Monthly Impact Tracker</Text>
//       {dailyPoints.length > 0 ? (
//         <BChart
//           data={{
//             labels: labels,
//             datasets: [{ data: dailyPoints }]
//           }}
//           width={screenWidth - 20}
//           height={220}
//           yAxisSuffix=" pts"
//           chartConfig={{
//             backgroundColor: "#e26a00",
//             backgroundGradientFrom: "#fb8c00",
//             backgroundGradientTo: "#ffa726",
//             color: (opacity = 1) => `rgba(255,255,255,${opacity})`,
//             labelColor: (opacity = 1) => `rgba(255,255,255,${opacity})`,
//             decimalPlaces: 0
//           }}
//           style={{ marginVertical: 8, borderRadius: 16 }}
//         />
//       ) : (
//         <Text>No data for this month.</Text>
//       )}
//     </View>
//   );
// };

// /**********************
//  * 10) PROFILE SCREEN – Settings & Stats
//  **********************/
// const ProfileScreen: React.FC = () => {
//   const user = auth().currentUser;
//   const [profile, setProfile] = useState<UserProfile | null>(null);

//   useEffect(() => {
//     if (!user) return;
//     const unsub = firestore().collection("users").doc(user.uid)
//       .onSnapshot(doc => {
//         const data = doc.data();
//         if (data) setProfile(data as UserProfile);
//       });
//     return () => unsub();
//   }, [user]);

//   if (!user || !profile) {
//     return (
//       <View style={styles.container}>
//         <Text>Please sign in.</Text>
//       </View>
//     );
//   }

//   const toggleShowOnline = async () => {
//     await firestore().collection("users").doc(user.uid).update({
//       "privacy.showOnline": !profile.privacy.showOnline
//     });
//   };

//   const toggleContentFilter = async () => {
//     await firestore().collection("users").doc(user.uid).update({
//       "preferences.contentFilter": !profile.preferences.contentFilter
//     });
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.title}>Your Profile</Text>
//       <Text>Email: {profile.email}</Text>
//       <Text>Points: {profile.points}</Text>
//       <Text>Volunteer Hours: {profile.volunteerHours}</Text>
//       <Text>Streak: {profile.streak} days</Text>
//       <Text>Conversations: {profile.conversations}</Text>
//       <View style={styles.card}>
//         <Text style={{ fontWeight: 'bold' }}>Badges</Text>
//         {profile.badges.length === 0 ? (
//           <Text>No badges yet</Text>
//         ) : (
//           profile.badges.map((b, idx) => <Text key={idx}>🏆 {b}</Text>)
//         )}
//       </View>
//       <View style={styles.card}>
//         <Text style={{ fontWeight: 'bold' }}>Privacy Settings</Text>
//         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//           <Text>Show Online?</Text>
//           <Switch value={profile.privacy.showOnline} onValueChange={toggleShowOnline} />
//         </View>
//       </View>
//       <View style={styles.card}>
//         <Text style={{ fontWeight: 'bold' }}>Content Filter</Text>
//         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//           <Text>Hide sensitive content?</Text>
//           <Switch value={profile.preferences.contentFilter} onValueChange={toggleContentFilter} />
//         </View>
//       </View>
//     </ScrollView>
//   );
// };

// /**********************
//  * 11) COMMUNITY ENGAGEMENT – Live Events, Challenges, Goals
//  **********************/
// const CommunityEngagementScreen: React.FC = () => {
//   const [events] = useState([
//     { title: "Live Q&A with Therapist", date: "Mar 25, 4 PM" },
//     { title: "Group Meditation", date: "Apr 1, 2 PM" }
//   ]);
//   const [challenges] = useState([
//     { title: "7-Day Gratitude Challenge" },
//     { title: "Daily Mood Check-In" }
//   ]);
//   const [personalGoals, setPersonalGoals] = useState([
//     { goal: "Breathe 5 min daily", done: false },
//     { goal: "Journal 10 min daily", done: false }
//   ]);

//   const toggleGoal = (index: number) => {
//     const updated = [...personalGoals];
//     updated[index].done = !updated[index].done;
//     setPersonalGoals(updated);
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.title}>Community Engagement</Text>
//       <View style={styles.card}>
//         <Text style={{ fontWeight: 'bold' }}>Live Events</Text>
//         {events.map((ev, i) => (
//           <View key={i} style={{ marginVertical: 5 }}>
//             <Text>{ev.title} - {ev.date}</Text>
//             <Button title="RSVP" onPress={() => Alert.alert("RSVP", "Feature not implemented")} />
//           </View>
//         ))}
//       </View>
//       <View style={styles.card}>
//         <Text style={{ fontWeight: 'bold' }}>Challenges</Text>
//         {challenges.map((ch, i) => (
//           <View key={i} style={{ marginVertical: 5 }}>
//             <Text>- {ch.title}</Text>
//             <Button title="Join" onPress={() => Alert.alert("Challenge", "Feature not implemented")} />
//           </View>
//         ))}
//       </View>
//       <View style={styles.card}>
//         <Text style={{ fontWeight: 'bold' }}>Personal Goals</Text>
//         {personalGoals.map((g, i) => (
//           <View key={i} style={{ marginVertical: 5 }}>
//             <Text>{g.goal} (Done? {g.done ? "Yes" : "No"})</Text>
//             <Button title="Toggle" onPress={() => toggleGoal(i)} />
//           </View>
//         ))}
//       </View>
//     </ScrollView>
//   );
// };

// /**********************
//  * 12) MAIN NAVIGATION – No Nested NavigationContainer
//  **********************/
// const Tab = createBottomTabNavigator();
// const Stack = createStackNavigator();

// const MainTabs: React.FC = () => {
//   return (
//     <Tab.Navigator>
//       <Tab.Screen name="HomeFeed" component={HomeScreen} />
//       <Tab.Screen name="Match" component={PeerMatchScreen} />
//       <Tab.Screen name="Points" component={PointsScreen} />
//       <Tab.Screen name="Impact" component={ImpactTrackerScreen} />
//       <Tab.Screen name="Profile" component={ProfileScreen} />
//       <Tab.Screen name="Engagement" component={CommunityEngagementScreen} />
//     </Tab.Navigator>
//   );
// };

// const RootNavigator: React.FC = () => {
//   return (
//     <Stack.Navigator screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="Auth" component={AuthScreen} />
//       <Stack.Screen name="Main" component={MainTabs} />
//       <Stack.Screen name="CreatePost" component={CreatePostScreen} />
//       <Stack.Screen name="PostDetail" component={PostDetailScreen} />
//       <Stack.Screen name="GroupChat" component={GroupChatScreen} />
//     </Stack.Navigator>
//   );
// };

// /**********************
//  * IMPORTANT: Export only the RootNavigator!
//  * (Do not wrap in an additional NavigationContainer if your index.tsx already does.)
//  **********************/
// export default RootNavigator;

// /**********************
//  * STYLES
//  **********************/
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginBottom: 10,
//     textAlign: 'center'
//   },
//   card: {
//     backgroundColor: '#e0f7fa',
//     padding: 15,
//     marginVertical: 8,
//     borderRadius: 10
//   },
//   input: {
//     height: 40,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     marginBottom: 10,
//     paddingHorizontal: 10,
//     borderRadius: 5
//   }
// });
// App.tsx


// App.tsx

// App.tsx - Monolithic file containing all code
// App.tsx - Monolithic file for Expo project

// App.tsx - Complete Monolithic TSX File

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Video, Audio } from 'expo-av';
import { GiftedChat } from 'react-native-gifted-chat';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import '@/components/ExternalLink';

// Firebase v9 modular imports
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  increment,
  getDocs,
  limit,
  where,
  DocumentSnapshot,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

/* ================= Firebase Setup ================= */
const firebaseConfig = {
  apiKey: "AIzaSyA3S-mh_PsohALYeybTqLK9cUx-r2NK82o",
  authDomain: "mentalhealth-25825.firebaseapp.com",
  databaseURL: "https://mentalhealth-25825-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mentalhealth-25825",
  storageBucket: "mentalhealth-25825.firebasestorage.app",
  messagingSenderId: "465515986694",
  appId: "1:465515986694:web:accfe59351e381d01ce887",
  measurementId: "G-PSV2KD6403"
};
const appFirebase = initializeApp(firebaseConfig);
const auth = getAuth(appFirebase);
const firestore = getFirestore(appFirebase);
const storage = getStorage(appFirebase);

/* ================= Auth Context ================= */
interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  loading: true,
});

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser: User | null) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

/* ================= Services ================= */

// Auth Service
const AuthService = {
  signUp: async (
    email: string,
    password: string,
    displayName: string
  ): Promise<UserCredential> => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const { uid } = userCredential.user;
    await setDoc(doc(firestore, 'users', uid), {
      displayName,
      email,
      interests: [] as string[],
      points: 0,
      badges: [] as string[],
      onlineStatus: true,
      anonymous: false,
      createdAt: serverTimestamp(),
    });
    return userCredential;
  },
  login: async (email: string, password: string): Promise<UserCredential> => {
    return await signInWithEmailAndPassword(auth, email, password);
  },
  logout: async () => {
    return await signOut(auth);
  },
};

// Chat Service
interface ChatMessage {
  text: string;
  senderId: string;
  type?: 'text' | 'audio';
  audioUrl?: string | null;
  createdAt?: any;
}

const ChatService = {
  sendMessage: async (chatId: string, message: ChatMessage) => {
    await addDoc(collection(firestore, 'chats', chatId, 'messages'), {
      ...message,
      createdAt: serverTimestamp(),
    });
  },
  subscribeToMessages: (chatId: string, callback: (msgs: any[]) => void) => {
    const q = query(
      collection(firestore, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        _id: doc.id,
        ...doc.data(),
      }));
      callback(messages);
    });
  },
};

// Moderation Service (Basic keyword-based)
const ModerationService = {
  moderateMessage: (text: string) => {
    const lowerText = text.toLowerCase();
    const flagged = ['hate', 'stupid', 'idiot'].some((word) =>
      lowerText.includes(word)
    );
    const distress = ["i want to die", "i can't go on"].some((phrase) =>
      lowerText.includes(phrase)
    );
    return { flagged, distress };
  },
};

// Points Service
const PointsService = {
  addPoints: async (userId: string, pointsToAdd: number) => {
    const userRef = doc(firestore, 'users', userId);
    await updateDoc(userRef, {
      points: increment(pointsToAdd),
    });
  },
  getLeaderboard: async () => {
    const q = query(
      collection(firestore, 'users'),
      orderBy('points', 'desc'),
      limit(10)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data());
  },
};

/* ================= Components ================= */

// Custom Button Component
interface CustomButtonProps {
  title: string;
  onPress: () => void;
}
const CustomButton: React.FC<CustomButtonProps> = ({ title, onPress }) => (
  <TouchableOpacity style={buttonStyles.button} onPress={onPress}>
    <Text style={buttonStyles.buttonText}>{title}</Text>
  </TouchableOpacity>
);
const buttonStyles = StyleSheet.create({
  button: { backgroundColor: '#007AFF', padding: 10, borderRadius: 5, margin: 5 },
  buttonText: { color: '#fff', fontSize: 16, textAlign: 'center' },
});

// Video Player Component
interface VideoPlayerProps {
  source: { uri: string };
}
const VideoPlayer: React.FC<VideoPlayerProps> = ({ source }) => {
  return (
    <View style={videoStyles.container}>
      <Video
        source={source}
        style={videoStyles.video}
        useNativeControls
        // Casting to any to satisfy TypeScript for now : must be set to a strict data type in production
        resizeMode={'contain' as any}
      />
    </View>
  );
};
const videoStyles = StyleSheet.create({
  container: { height: 200, width: '100%' },
  video: { height: '100%', width: '100%' },
});

// Audio Player Component
interface AudioPlayerProps {
  audioUrl: string;
}
const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl }) => {
  const [sound, setSound] = useState<any>(null);
  const [playing, setPlaying] = useState<boolean>(false);

  const playSound = async () => {
    const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
    setSound(sound);
    await sound.playAsync();
    setPlaying(true);
  };

  const stopSound = async () => {
    if (sound) {
      await sound.stopAsync();
      setPlaying(false);
    }
  };

  return (
    <View style={audioStyles.container}>
      <Text>Audio Message</Text>
      {playing ? (
        <Button title="Stop" onPress={stopSound} />
      ) : (
        <Button title="Play" onPress={playSound} />
      )}
    </View>
  );
};
const audioStyles = StyleSheet.create({
  container: { padding: 10, alignItems: 'center' },
});

/* ================= Navigation Setup ================= */
export type RootStackParamList = {
  Login:  undefined;
  Signup: undefined;
  Home: undefined;
  Category: { category: { id: string; name: string } };
  Thread: { thread: { id: string; title: string; tone: string } };
  Match: undefined;
  Chat: { chatId: string; peer: any };
  Leaderboard: undefined;
  Profile: undefined;
  Impact: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Wrap screen components to bypass strict type issues if needed
const WrappedScreen = (Component: React.FC<any>) => (props: any) =>
  <Component {...props} />;

const AppNavigator: React.FC = () => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  return (
    <Stack.Navigator>
      {user ? (
        <>
          <Stack.Screen name="Home" component={WrappedScreen(HomeScreen)} />
          <Stack.Screen name="Category" component={WrappedScreen(CategoryScreen)} />
          <Stack.Screen name="Thread" component={WrappedScreen(ThreadScreen)} />
          <Stack.Screen name="Match" component={WrappedScreen(MatchScreen)} />
          <Stack.Screen name="Chat" component={WrappedScreen(ChatScreen)} />
          <Stack.Screen name="Leaderboard" component={WrappedScreen(LeaderboardScreen)} />
          <Stack.Screen name="Profile" component={WrappedScreen(ProfileScreen)} />
          <Stack.Screen name="Impact" component={WrappedScreen(ImpactTrackerScreen)} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={WrappedScreen(LoginScreen)} />
          <Stack.Screen name="Signup" component={WrappedScreen(SignupScreen)} />
        </>
      )}
    </Stack.Navigator>
  );
};

/* ================= Screens ================= */

// LoginScreen
type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { setUser } = useContext(AuthContext);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleLogin = async () => {
    try {
      const userCredential = await AuthService.login(email, password);
      setUser(userCredential.user);
    } catch (error: any) {
      alert('Login failed: ' + error.message);
    }
  };

  return (
    <View style={screenStyles.container}>
      <Text style={screenStyles.title}>Peer Support App Login</Text>
      <TextInput
        style={screenStyles.input}
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={screenStyles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Log In" onPress={handleLogin} />
      <Button title="Sign Up" onPress={() => navigation.navigate('Signup')} />
    </View>
  );
};

// SignupScreen
type SignupScreenProps = NativeStackScreenProps<RootStackParamList, 'Signup'>;
const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const { setUser } = useContext(AuthContext);
  const [displayName, setDisplayName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleSignup = async () => {
    try {
      const userCredential = await AuthService.signUp(email, password, displayName);
      setUser(userCredential.user);
    } catch (error: any) {
      alert('Signup failed: ' + error.message);
    }
  };

  return (
    <View style={screenStyles.container}>
      <Text style={screenStyles.title}>Sign Up for Peer Support</Text>
      <TextInput
        style={screenStyles.input}
        placeholder="Display Name"
        value={displayName}
        onChangeText={setDisplayName}
      />
      <TextInput
        style={screenStyles.input}
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={screenStyles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Sign Up" onPress={handleSignup} />
      <Button title="Already have an account? Log In" onPress={() => navigation.navigate('Login')} />
    </View>
  );
};

// HomeScreen
type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
interface Category {
  id: string;
  name: string;
}
interface Journey {
  id: string;
  title: string;
  completed: boolean;
}
const sampleCategories: Category[] = [
  { id: '1', name: 'Anxiety' },
  { id: '2', name: 'Depression' },
  { id: '3', name: 'Relationships' },
];
const sampleJourneys: Journey[] = [
  { id: '1', title: 'Coping with Stress', completed: false },
  { id: '2', title: 'Building Self-Esteem', completed: false },
];
const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const renderCategory = ({ item }: { item: Category }) => (
    <Button
      title={item.name}
      onPress={() => navigation.navigate('Category', { category: item })}
    />
  );
  const renderJourney = ({ item }: { item: Journey }) => (
    <View style={screenStyles.journeyCard}>
      <Text style={screenStyles.journeyTitle}>{item.title}</Text>
      <Button
        title={item.completed ? 'Completed' : 'Mark as Read'}
        onPress={() => alert('Journey progress updated')}
      />
    </View>
  );
  return (
    <View style={screenStyles.container}>
      <Text style={screenStyles.header}>Welcome to Peer Support</Text>
      <Text style={screenStyles.subheader}>Discussion Categories</Text>
      <FlatList
        data={sampleCategories}
        keyExtractor={(item) => item.id}
        renderItem={renderCategory}
        horizontal
      />
      <Text style={screenStyles.subheader}>Motivational Journeys</Text>
      <FlatList
        data={sampleJourneys}
        keyExtractor={(item) => item.id}
        renderItem={renderJourney}
      />
      <View style={screenStyles.navButtons}>
        <Button title="Match & Chat" onPress={() => navigation.navigate('Match')} />
        <Button title="Leaderboard" onPress={() => navigation.navigate('Leaderboard')} />
        <Button title="Profile" onPress={() => navigation.navigate('Profile')} />
        <Button title="Impact Tracker" onPress={() => navigation.navigate('Impact')} />
      </View>
    </View>
  );
};

// CategoryScreen
type CategoryScreenProps = NativeStackScreenProps<RootStackParamList, 'Category'>;
interface Thread {
  id: string;
  title: string;
  tone: string;
}
const sampleThreads: Thread[] = [
  { id: 't1', title: 'Managing Anxiety at Work', tone: 'Serious' },
  { id: 't2', title: 'Funny Anxiety Moments', tone: 'Casual' },
];
const CategoryScreen: React.FC<CategoryScreenProps> = ({ route, navigation }) => {
  const { category } = route.params;
  const renderThread = ({ item }: { item: Thread }) => (
    <Button
      title={`${item.title} (${item.tone})`}
      onPress={() => navigation.navigate('Thread', { thread: item })}
    />
  );
  return (
    <View style={screenStyles.container}>
      <Text style={screenStyles.header}>Category: {category.name}</Text>
      <FlatList data={sampleThreads} keyExtractor={(item) => item.id} renderItem={renderThread} />
    </View>
  );
};

// ThreadScreen
type ThreadScreenProps = NativeStackScreenProps<RootStackParamList, 'Thread'>;
const ThreadScreen: React.FC<ThreadScreenProps> = ({ route }) => {
  const { thread } = route.params;
  const chatId = 'thread_' + thread.id;
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState<string>('');

  useEffect(() => {
    const unsubscribe = ChatService.subscribeToMessages(chatId, (msgs) =>
      setMessages(msgs)
    );
    return () => unsubscribe();
  }, [chatId]);

  const handleSend = async () => {
    const moderationResult = ModerationService.moderateMessage(input);
    if (moderationResult.distress) {
      await ChatService.sendMessage(chatId, {
        text: "It sounds like you're struggling. Please consider reaching out for help.",
        senderId: 'system',
      });
    }
    const finalText = moderationResult.flagged
      ? '[Message hidden by filter]'
      : input;
    await ChatService.sendMessage(chatId, {
      text: finalText,
      senderId: auth.currentUser?.uid || '',
    });
    setInput('');
  };

  return (
    <View style={screenStyles.container}>
      <Text style={screenStyles.header}>{thread.title}</Text>
      <GiftedChat
        messages={messages}
        onSend={(msgs: any[]) => handleSend()}
        user={{ _id: auth.currentUser?.uid || 'unknown' }}
      />
      <TextInput
        style={screenStyles.input}
        placeholder="Type a message..."
        value={input}
        onChangeText={setInput}
      />
      <Button title="Send" onPress={handleSend} />
    </View>
  );
};

// MatchScreen
type MatchScreenProps = NativeStackScreenProps<RootStackParamList, 'Match'>;
interface UserProfile {
  id: string;
  displayName: string;
  interests: string[];
  anonymous: boolean;
}
const MatchScreen: React.FC<MatchScreenProps> = ({ navigation }) => {
  const [matches, setMatches] = useState<UserProfile[]>([]);
  const currentUserId = auth.currentUser?.uid || '';

  useEffect(() => {
    const q = query(
      collection(firestore, 'users'),
      where('onlineStatus', '==', true)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users: UserProfile[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as Omit<UserProfile, 'id'>;
        if (doc.id !== currentUserId && data.interests && data.interests.length > 0) {
          users.push({ id: doc.id, ...data });
        }
      });
      setMatches(users);
    });
    return () => unsubscribe();
  }, [currentUserId]);

  const renderUser = ({ item }: { item: UserProfile }) => (
    <View style={screenStyles.userCard}>
      <Text>{item.anonymous ? 'Anonymous' : item.displayName}</Text>
      <Text>Interests: {item.interests.join(', ')}</Text>
      <Button
        title="Chat"
        onPress={() => {
          const chatId =
            currentUserId < item.id
              ? `${currentUserId}_${item.id}`
              : `${item.id}_${currentUserId}`;
          navigation.navigate('Chat', { chatId, peer: item });
        }}
      />
    </View>
  );

  return (
    <View style={screenStyles.container}>
      <Text style={screenStyles.header}>Peer Matches</Text>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
      />
    </View>
  );
};

// ChatScreen
type ChatScreenProps = NativeStackScreenProps<RootStackParamList, 'Chat'>;
const ChatScreen: React.FC<ChatScreenProps> = ({ route }) => {
  const { chatId } = route.params;
  const [messages, setMessages] = useState<any[]>([]);
  const [recording, setRecording] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = ChatService.subscribeToMessages(chatId, (msgs) =>
      setMessages(msgs)
    );
    return () => unsubscribe();
  }, [chatId]);

  const handleSend = async (newMessages: any[]) => {
    for (let msg of newMessages) {
      const moderationResult = ModerationService.moderateMessage(msg.text);
      const finalText = moderationResult.flagged
        ? '[Message hidden by filter]'
        : msg.text;
      await ChatService.sendMessage(chatId, {
        text: finalText,
        senderId: auth.currentUser?.uid || '',
      });
    }
  };

  const onStartRecord = async () => {
    setRecording(true);
    // Using 'as any' cast for methods not typed properly.
    const result = await (AudioRecorderPlayer as any).startRecorder();
    console.log('Recording started at: ', result);
  };

  const onStopRecord = async () => {
    const result = await (AudioRecorderPlayer as any).stopRecorder();
    setRecording(false);
    const fileName = `chatVoice/${chatId}/${Date.now()}.m4a`;
    const storageRef = ref(storage, fileName);
    const response = await fetch(result);
    const blob = await response.blob();
    await uploadBytes(storageRef, blob);
    const audioUrl = await getDownloadURL(storageRef);
    await ChatService.sendMessage(chatId, {
      text: '',
      senderId: auth.currentUser?.uid || '',
      type: 'audio',
      audioUrl,
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <GiftedChat
        messages={messages}
        onSend={(msgs: any[]) => handleSend(msgs)}
        user={{ _id: auth.currentUser?.uid || 'unknown' }}
      />
      <View style={screenStyles.recordContainer}>
        {recording ? (
          <Button title="Stop Recording" onPress={onStopRecord} />
        ) : (
          <Button title="Record Voice Message" onPress={onStartRecord} />
        )}
      </View>
    </View>
  );
};

// LeaderboardScreen
type LeaderboardScreenProps = NativeStackScreenProps<RootStackParamList, 'Leaderboard'>;
const LeaderboardScreen: React.FC<LeaderboardScreenProps> = () => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const data = await PointsService.getLeaderboard();
      setLeaderboard(data);
    };
    fetchLeaderboard();
  }, []);

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <View style={screenStyles.leaderboardItem}>
      <Text style={screenStyles.rank}>{index + 1}.</Text>
      <Text style={screenStyles.name}>
        {item.anonymous ? 'Anonymous' : item.displayName}
      </Text>
      <Text style={screenStyles.points}>{item.points} pts</Text>
    </View>
  );

  return (
    <View style={screenStyles.container}>
      <Text style={screenStyles.header}>Leaderboard</Text>
      <FlatList
        data={leaderboard}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
      />
    </View>
  );
};

// ProfileScreen
type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'Profile'>;
const ProfileScreen: React.FC<ProfileScreenProps> = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState<any>(null);
  const [onlineStatus, setOnlineStatus] = useState<boolean>(true);
  const [anonymous, setAnonymous] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [language, setLanguage] = useState<string>('en');
  const [contentFilter, setContentFilter] = useState<boolean>(true);

  useEffect(() => {
    const userDocRef = doc(firestore, 'users', user?.uid || '');
    const unsubscribe = onSnapshot(userDocRef, (docSnapshot: DocumentSnapshot<any>) => {
      const data = docSnapshot.data();
      setProfile(data);
      setOnlineStatus(data?.onlineStatus);
      setAnonymous(data?.anonymous);
    });
    return () => unsubscribe && unsubscribe();
  }, [user?.uid]);
  const handleLogout = async () => {
    await AuthService.logout();
  };

  const updateField = (field: string, value: any) => {
    setProfile((prev: any) => ({ ...prev, [field]: value }));
    updateDoc(doc(firestore, 'users', user?.uid || ''), { [field]: value });
  };

  return (
    <View style={screenStyles.container}>
      <Text style={screenStyles.header}>Profile</Text>
      {profile && (
        <View style={screenStyles.info}>
          <Text>Name: {anonymous ? 'Anonymous' : profile.displayName}</Text>
          <Text>Email: {profile.email}</Text>
          <Text>Points: {profile.points}</Text>
          <Text>
            Volunteer Hours: {(profile.points / 10).toFixed(1)}
          </Text>
        </View>
      )}
      <View style={screenStyles.setting}>
        <Text>Appear Online</Text>
        <Switch
          value={onlineStatus}
          onValueChange={(value) => updateField('onlineStatus', value)}
        />
      </View>
      <View style={screenStyles.setting}>
        <Text>Anonymous Mode</Text>
        <Switch
          value={anonymous}
          onValueChange={(value) => updateField('anonymous', value)}
        />
      </View>
      <View style={screenStyles.setting}>
        <Text>Notifications</Text>
        <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
      </View>
      <View style={screenStyles.setting}>
        <Text>Language: {language}</Text>
        <Button
          title="Toggle Language"
          onPress={() => {
            const newLang = language === 'en' ? 'es' : 'en';
            setLanguage(newLang);
            updateField('language', newLang);
          }}
        />
      </View>
      <View style={screenStyles.setting}>
        <Text>Content Filter</Text>
        <Switch value={contentFilter} onValueChange={setContentFilter} />
      </View>
      <Button title="Log Out" onPress={handleLogout} />
    </View>
  );
};

// ImpactTrackerScreen
const ImpactTrackerScreen: React.FC = () => {
  return (
    <View style={screenStyles.centeredContainer}>
      <Text style={screenStyles.header}>Impact Tracker</Text>
      <Text>Graph of your points over time would appear here.</Text>
      <Text>Your current streak: 5 days</Text>
      <Text>Achievements: Newcomer, Helper</Text>
    </View>
  );
};

/* ================= Global Screen Styles ================= */
const screenStyles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  centeredContainer: { flex: 1, padding: 16, alignItems: 'center', justifyContent: 'center' },
  header: { fontSize: 28, textAlign: 'center', marginBottom: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, marginBottom: 10, padding: 8 },
  journeyCard: { borderWidth: 1, padding: 10, marginVertical: 5 },
  journeyTitle: { fontSize: 16, marginBottom: 5 },
  subheader: { fontSize: 20, marginTop: 10 },
  navButtons: { marginTop: 20 },
  userCard: { borderWidth: 1, padding: 10, marginBottom: 10 },
  recordContainer: { padding: 10, backgroundColor: '#f0f0f0' },
  leaderboardItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderBottomWidth: 1 },
  rank: { width: 30 },
  name: { flex: 1 },
  points: { width: 80, textAlign: 'right' },
  info: { marginBottom: 20 },
  setting: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
});

/* ================= App Component ================= */
const App: React.FC = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
