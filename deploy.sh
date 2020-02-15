cd ~/rdbbackend
export PATH="/home/torkel_velure:$PATH"
git pull
rm -r target
lein ring uberwar

mkdir -p target/war
cd target/war
jar xf ../rdbbackend-0.1.0-SNAPSHOT-standalone.war
cd WEB-INF

echo '<appengine-web-app xmlns="http://appengine.google.com/ns/1.0">
  <application>rdbbackend</application>
  <version>1</version>
  <threadsafe>false</threadsafe>
  <runtime>java8</runtime>
</appengine-web-app>' > appengine-web.xml

rm web.xml
echo '<?xml version="1.0" encoding="UTF-8"?><web-app xmlns="http://java.sun.com/xml/ns/javaee" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_2_5.xsd" version="2.5">
  <listener>
    <listener-class>rdbbackend.listener</listener-class>
  </listener>
  <servlet>
    <servlet-name>rdbbackend.core/app servlet</servlet-name>
    <servlet-class>rdbbackend.servlet</servlet-class>
  </servlet>
  <servlet-mapping>
    <servlet-name>rdbbackend.core/app servlet</servlet-name>
    <url-pattern>/*</url-pattern>
  </servlet-mapping>
  <security-constraint>
    <web-resource-collection>
        <web-resource-name>everything</web-resource-name>
        <url-pattern>/*</url-pattern>
    </web-resource-collection>
    <user-data-constraint>
        <transport-guarantee>CONFIDENTIAL</transport-guarantee>
    </user-data-constraint>
  </security-constraint>
</web-app>' > web.xml
cd ..
echo deploy
gcloud app deploy --quiet
echo FINISHED