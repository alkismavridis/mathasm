package eu.alkismavridis.mathasm.infrastructure.api.controller;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/pages")
public class HtmlController {
    //region FIELDS
    @Value("classpath:static/public/index.html")
    Resource htmlResource;
    //endregion


    @RequestMapping(value="**", method=RequestMethod.GET)
    public ResponseEntity queryWithParams() throws Exception {
        if(htmlResource==null) return ResponseEntity.status(500).body("Server does not host frontend files!");

        final InputStreamResource inputStreamResource = new InputStreamResource(htmlResource.getInputStream());
        final HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.add("Content-Type", "text/html");
        responseHeaders.add("Content-Length", htmlResource.contentLength()+"");

        return new ResponseEntity<>(inputStreamResource, responseHeaders, HttpStatus.OK);
    }
}
