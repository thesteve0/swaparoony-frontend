import React from 'react';
import {
    Page,
    PageSection,
    PageSectionVariants,
    Title,
    Card,
    CardBody,
} from '@patternfly/react-core';
import { CameraIcon } from '@patternfly/react-icons';

export const AppLayout: React.FC = () => {
    return (
        <Page>
        {/* Hero Section */}
        <PageSection variant={PageSectionVariants.dark} className="pf-v5-u-text-align-center">
        <Title headingLevel="h1" size="4xl" className="pf-v5-u-mb-md">
        <CameraIcon className="pf-v5-u-mr-sm" />
        Swaparoony Face Swap Experience
        </Title>
        <Title headingLevel="h2" size="lg" className="pf-v5-u-color-200">
        Transform your photo with AI-powered face swapping
        </Title>
        </PageSection>

        {/* Main Content */}
        <PageSection variant={PageSectionVariants.default}>
        <div className="swaparoony-main-content">
        <Card>
        <CardBody>
        <Title headingLevel="h3" size="xl" className="pf-v5-u-mb-lg">
        Get Started
        </Title>
        <p>
        Welcome to the Swaparoony face swap experience!
        In the next phase, we'll add camera functionality here.
        </p>
        </CardBody>
        </Card>
        </div>
        </PageSection>
        </Page>
    );
};
