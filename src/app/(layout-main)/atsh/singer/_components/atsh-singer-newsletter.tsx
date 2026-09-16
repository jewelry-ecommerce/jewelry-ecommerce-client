"use client";

import { useSubscriber } from "@/app/(layout-main)/trang-chu/hooks/use-subscriber.hook";
import FormContactComponent from "@/components/form-contact/form-contact.component";

const AtshSingerNewsletter = () => {
  const subscriberProps = useSubscriber();
  return <FormContactComponent {...subscriberProps} />;
};

export default AtshSingerNewsletter;
