import {
    Body,
    Button,
    Container,
    Head,
    Hr,
    Html,
    Img,
    Preview,
    Section,
    Text,
  } from "@react-email/components";
  import * as React from "react";
  
  
  
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  
  export const EmailTemplate = ({
    UserName,
    Email,
    Time,
    Date,
    doctor,
    Note
  }) => (
    <Html>
      <Head />
      <Preview>
         Welcome To Glowing Smiles Doctors, Your Doctor In Troy, MI.
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src={`${baseUrl}/logo.svg`}
            width="170"
            height="50"
            alt="Glowing Smiles Doctor"
            style={logo}
          />
          <Text style={paragraph}>Hi {UserName},</Text>
          <Text style={paragraph}>
            Welcome to GlowingSmilesDoctor! Your appointment with doctor {doctor} has been booked {Date} {Time}.
          </Text>
          <Section style={btnContainer}>
            <Button style={button} href="http://localhost:3000/my-booking">
              Check Appointment
            </Button>
          </Section>
          <Text style={paragraph}>
            Best,
            <br />
            Glowing Smiles Doctor
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
                1755 West Big Beaver Road Troy, MI 48084 <br />
                (248) 643-7530
          </Text>
        </Container>
      </Body>
    </Html>
  );
  
  
  
  export default EmailTemplate;
  
  const main = {
    backgroundColor: "#ffffff",
    fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  };
  
  const container = {
    margin: "0 auto",
    padding: "20px 0 48px",
  };
  
  const logo = {
    margin: "0 auto",
  };
  
  const paragraph = {
    fontSize: "16px",
    lineHeight: "26px",
  };
  
  const btnContainer = {
    textAlign: "center" ,
  };
  
  const button = {
    backgroundColor: "#5F51E8",
    borderRadius: "3px",
    color: "#fff",
    fontSize: "16px",
    textDecoration: "none",
    textAlign: "center" ,
    display: "block",
    padding: "12px",
  };
  
  const hr = {
    borderColor: "#cccccc",
    margin: "20px 0",
  };
  
  const footer = {
    color: "#8898aa",
    fontSize: "12px",
  };
  