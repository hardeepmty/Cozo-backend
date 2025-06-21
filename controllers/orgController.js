const Organization = require('../models/Organization')
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Create organization
exports.createOrganization = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const org = await Organization.create({
      name,
      description,
      createdBy: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }]
    });

    // Add organization to user's org list
    await User.findByIdAndUpdate(req.user._id, {
      $push: { organizations: org._id }
    });

    res.status(201).json({ success: true, data: org });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Join organization
exports.joinOrganization = async (req, res) => {
  try {
    const { joinCode } = req.body;
    
    const org = await Organization.findOne({ joinCode });
    
    if (!org) {
      return res.status(404).json({ 
        success: false, 
        error: 'Organization not found with this code' 
      });
    }

    // Check if user is already a member
    const isMember = org.members.some(m => 
      m.user.toString() === req.user._id.toString()
    );

    if (isMember) {
      return res.status(400).json({ 
        success: false, 
        error: 'You are already a member of this organization' 
      });
    }

    // Add user to organization
    org.members.push({ user: req.user._id, role: 'member' });
    await org.save();

    // Add organization to user's org list
    await User.findByIdAndUpdate(req.user._id, {
      $push: { organizations: org._id }
    });

    res.status(200).json({ success: true, data: org });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all organizations for user
exports.getMyOrganizations = async (req, res) => {
  try {
    const orgs = await Organization.find({ 
      'members.user': req.user._id 
    }).populate('createdBy', 'name');

    res.status(200).json({ success: true, data: orgs });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get organization details
exports.getOrganization = async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('members.user', 'name email avatar');

    if (!org) {
      return res.status(404).json({ 
        success: false, 
        error: 'Organization not found' 
      });
    }

    // Check if user is member
    const isMember = org.members.some(m => 
      m.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ 
        success: false, 
        error: 'Not authorized to access this organization' 
      });
    }

    res.status(200).json({ success: true, data: org });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};


exports.inviteUser = async (req, res) => {
    try {
        const { emails } = req.body;
        const orgId = req.params.id;

        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No emails provided or the format is invalid. Please send an array of emails.'
            });
        }

        const org = await Organization.findById(orgId).populate('createdBy', 'name');

        if (!org) {
            return res.status(404).json({
                success: false,
                error: 'Organization not found'
            });
        }

        // Check if requester is admin
        const isAdmin = org.members.some(m =>
            m.user.toString() === req.user._id.toString() && m.role === 'admin'
        );

        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                error: 'Only admins can invite users to this organization.'
            });
        }

        // Create email transporter (only once)
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_SERVER || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USERNAME || 'rajdeveloper564@gmail.com',
                pass: process.env.SMTP_PASSWORD || 'jrme xpxi xykp vwlh'
            }
        });

        const successfulInvites = [];
        const failedInvites = [];

        // --- Loop through each email to process invitations ---
        for (const email of emails) {
            try {
                // Check if user exists
                const user = await User.findOne({ email });

                if (!user) {
                    failedInvites.push({ email, reason: 'User not found with this email on the platform.' });
                    continue; // Skip to the next email
                }

                // Check if user is already a member of this organization
                const isMember = org.members.some(m =>
                    m.user.toString() === user._id.toString()
                );

                if (isMember) {
                    failedInvites.push({ email, reason: 'User is already a member of this organization.' });
                    continue; // Skip to the next email
                }

                // Email content for the current user
                const mailOptions = {
                    from: `"Jira Clone" <${process.env.EMAIL_FROM || 'rajdeveloper4444@gmail.com'}>`,
                    to: email,
                    subject: `Invitation to join ${org.name}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #2563eb;">You've been invited!</h2>
                            <p>You've been invited by ${org.createdBy.name} to join the organization <strong>${org.name}</strong> on Jira Clone.</p>

                            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 0;">Organization: <strong>${org.name}</strong></p>
                                <p style="margin: 8px 0 0 0;">Join Code: <strong style="font-size: 18px;">${org.joinCode}</strong></p>
                            </div>

                            <p>To accept this invitation:</p>
                            <ol>
                                <li>Log in to your Jira Clone account</li>
                                <li>Go to "Organizations"</li>
                                <li>Click "Join Organization"</li>
                                <li>Enter the join code above</li>
                            </ol>

                            <p style="margin-top: 24px;">Happy collaborating!</p>
                            <p>The Jira Clone Team</p>
                        </div>
                    `
                };

                // Send email
                await transporter.sendMail(mailOptions);
                successfulInvites.push({ email, status: 'Invitation email sent' });

            } catch (innerErr) {
                console.error(`Error processing invitation for ${email}:`, innerErr);
                failedInvites.push({ email, reason: `Failed to send invitation email: ${innerErr.message}` });
            }
        }

        // --- Consolidated response based on outcomes ---
        if (successfulInvites.length > 0) {
            res.status(200).json({
                success: true,
                message: `${successfulInvites.length} invitation(s) sent successfully. ${failedInvites.length} invitation(s) failed.`,
                data: {
                    successfulInvites,
                    failedInvites,
                    joinCode: org.joinCode // Still include join code if any invites succeeded
                }
            });
        } else {
            // If all invitations failed
            res.status(400).json({ // Use 400 as none succeeded due to client-side data issues (e.g., users not found/already members)
                success: false,
                error: `No invitations could be sent. All ${failedInvites.length} invitations failed.`,
                data: {
                    successfulInvites, // Will be empty
                    failedInvites,
                    joinCode: org.joinCode // Still include join code for reference
                }
            });
        }

    } catch (err) {
        // Catch any unexpected errors that occurred outside the per-email loop
        console.error('Error in inviteUser controller:', err);
        res.status(500).json({
            success: false,
            error: 'An unexpected server error occurred while processing invitations.',
            details: err.message
        });
    }
};