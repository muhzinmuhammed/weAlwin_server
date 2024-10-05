import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/genrateToken.js";

// Regex patterns for validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email format validation
const nameRegex = /^[a-zA-Z\s]{2,30}$/; // Name should be 2 to 30 characters long and only contain letters and spaces
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
const userRegister = async (req, res) => {
    try {
        const { name, userEmail, password, referrerId } = req.body;

        // Validate input fields
        if (!name || !userEmail || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user already exists
        const userExist = await userModel.findOne({ userEmail });
        if (userExist) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new userModel({
            name,
            userEmail,
            password: hashedPassword,
        });

        // Save the new user to the DB
        const savedUser = await newUser.save();

        // If there is a referrer, update the referral chain and earnings
        if (referrerId) {
            const referrer = await userModel.findById(referrerId);


            if (referrer) {
                // Add newUser to the referrer's Level 1 referrals (Direct Referral)
                referrer.referral_level_1.push(savedUser._id);
                // Calculate and add Level 1 earnings (10%)
                referrer.earnings += 1000 * 0.10;
                await referrer.save();

                await assignRewards(referrer);

                // Set newUser's referrerId to track the referral chain
                savedUser.referrerId = referrerId;
                await savedUser.save();
             

                // Check for Level 2 (referrer's referrer)
                const level2Referrer = referrer.referrerId ? await userModel.findById(referrer.referrerId) : null;
                if (level2Referrer) {
                    level2Referrer.referral_level_2.push(savedUser._id);
                    // Calculate and add Level 2 earnings (8%)
                    level2Referrer.earnings += 1000 * 0.08;
                    await level2Referrer.save();
                    await assignRewards(level2Referrer);

                    // Check for Level 3 (referrer of the referrer's referrer)
                    const level3Referrer = level2Referrer.referrerId ? await userModel.findById(level2Referrer.referrerId) : null;
                    if (level3Referrer) {
                        level3Referrer.referral_level_3.push(savedUser._id);
                        // Calculate and add Level 3 earnings (5%)
                        level3Referrer.earnings += 1000 * 0.05;
                        await level3Referrer.save();
                        await assignRewards(level3Referrer);
                    }
                }
            }
        }

        // Check and assign rewards based on total earnings
       
        
        return res.status(201).json({ message: "User registered successfully", user: savedUser });

    } catch (error) {
        console.error("Registration error:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};



// Function to assign rewards based on total earnings
const assignRewards = async (user) => {
   
    if (user.earnings >= 1000) {
        user.rewards = "Diamond";
    } else if (user.earnings >= 700) {
    
        
        user.rewards = "Gold";
    } else if (user.earnings >= 500) {
        user.rewards = "Silver";
    } else {
        user.rewards = null; // No reward for earnings below $500
    }
    await user.save();
};

// User Login
const userLogin = async (req, res) => {
    try {
        const { userEmail, password } = req.body;

        // Validate input fields
        if (!userEmail || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Find the user by email
        const user = await userModel.findOne({ userEmail });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid Password" });
        }
        const token = generateToken(user._id);

        return res.json({
            _id: user._id,
            name: user.name,
            //phone: user.userPhone,
            email: user.userEmail,
           
            token,
          });
    } catch (error) {
        console.error("Login error:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export { userRegister, userLogin };