import { connect } from "mongoose";

const dbConnect = async () => {
  try {
    const cs = process.env.CONNECTION_STRING || "";
    const masked = cs.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:****@");
    let hostInfo = "unknown";
    try {
      hostInfo = new URL(cs).host;
    } catch (e) {
      hostInfo = "invalid-url";
    }
    console.log(
      "Attempting DB connect — host:",
      hostInfo,
      " connectionString(masked):",
      masked
    );

    
    // Basic validation: check for obvious malformed credentials
    if (!cs) {
      console.error(
        "DB connection string is empty. Set CONNECTION_STRING in .env"
      );
      return;
    }
    if (/[<>\s]/.test(cs)) {
      console.error(
        "DB connection string contains illegal characters (<> or spaces). Check .env formatting."
      );
      return;
    }
                                                     
    const authorityMatch = cs.match(/^[a-z0-9+.-]+:\/\/([^@]+)@/i);
    if (authorityMatch) {
      const userinfo = authorityMatch[1];
      if (userinfo.includes("@")) {
        console.error(
          "DB connection string appears to have an unencoded '@' in the credentials. URL-encode special characters in the password (e.g. '@' => '%40')."
        );
        return;
      }
    }
    
    await connect(cs);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection error:", error);
    
    return;
  }
};


export default dbConnect;
                                          
