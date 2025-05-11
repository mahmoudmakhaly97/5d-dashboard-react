
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
        <h1 className="text-4xl font-bold mb-6">Welcome to Task Dashboard</h1>
        <p className="text-lg text-muted-foreground max-w-md mb-8">
          View departments, employees and track tasks with our interactive timeline dashboard.
        </p>
        <Link to="/dashboard">
          <Button size="lg">
            View Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;
